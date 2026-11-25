import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { RootStackParamList } from '../App';
import { SHOW_UNREVIEWED } from '../core/build';
import { CARD_CATEGORY_KEYS } from '../core/catalog';
import { editorCategories, needsSafetyReminder } from '../core/homeModel';
import type { CategoryRecord } from '../data/categoriesRepo';
import { PromptDialog } from '../ui/PromptDialog';
import { categoryName } from '../ui/HomeSections';
import { chooseMainSymbol, defaultCategoryFor } from '../core/editorModel';
import { DRAFT_SETTING_KEY, serializeDraft, type EditorDraft } from '../core/draft';
import { t } from '../core/i18n';
import type { JpegInfo } from '../core/jpegInfo';
import { CardValidationError } from '../data/cardsRepo';
import { useData } from '../data/AppData';
import { choosePhoto, takePhoto, type PickOutcome } from '../platform/picker';
import { deletePhotoFiles, importPhoto, thumbUri } from '../platform/photoStore';
import { FilledButton, TonalButton } from '../ui/Buttons';
import { CardView } from '../ui/CardView';
import { ModifierChips } from '../ui/ModifierChips';
import { Sheet } from '../ui/Sheet';
import { SymbolPicker } from '../ui/SymbolPicker';
import { colors, radius, spacing, type } from '../ui/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'CardEditor'>;

interface PhotoRef {
  photoFile: string;
  thumbFile: string;
}

/**
 * New card and Edit card (one screen). Live preview; main symbol picker; up to two modifiers; optional photo;
 * label; show-label; category; one Save button at the bottom (App Style Sheet 8).
 */
export default function CardEditor({ navigation, route }: Props) {
  const { cards, settings, categories } = useData();
  const insets = useSafeAreaInsets();
  const cardId = route.params?.cardId;
  const recovery = route.params?.recovery;

  const [loaded, setLoaded] = useState(false);
  const [symbolId, setSymbolId] = useState<string | null>(null);
  const [badges, setBadges] = useState<string[]>([]);
  const [label, setLabel] = useState('');
  const [showLabel, setShowLabel] = useState(false);
  const [categoryId, setCategoryId] = useState<string>(CARD_CATEGORY_KEYS[0]);
  const [categoryTouched, setCategoryTouched] = useState(false);
  const [photo, setPhoto] = useState<PhotoRef | null>(null);
  const [photoInfo, setPhotoInfo] = useState<JpegInfo | null>(null);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [photoSheet, setPhotoSheet] = useState(false);
  const [saving, setSaving] = useState(false);
  const [allCats, setAllCats] = useState<CategoryRecord[]>([]);
  const [newCat, setNewCat] = useState(false);

  const favourite = useRef(false);
  const initial = useRef('');
  const addedFiles = useRef<PhotoRef[]>([]); // photos imported during this editing session
  const originalPhoto = useRef<PhotoRef | null>(null);
  const allowLeave = useRef(false);

  const snapshot = useCallback(
    () => JSON.stringify({ symbolId, badges, label, showLabel, categoryId, photo: photo?.photoFile ?? null }),
    [symbolId, badges, label, showLabel, categoryId, photo],
  );

  // Load the card being edited, or restore a draft after Android closed the app during the camera.
  useEffect(() => {
    let alive = true;
    (async () => {
      if (recovery) {
        const d = recovery.draft;
        setSymbolId(d.symbolId);
        setBadges(d.badges);
        setLabel(d.label);
        setShowLabel(d.showLabel);
        setCategoryId(d.categoryId);
        setCategoryTouched(d.categoryTouched);
        const p = { photoFile: recovery.photo.photoFile, thumbFile: recovery.photo.thumbFile };
        setPhoto(p);
        setPhotoInfo(recovery.photo.info);
        addedFiles.current = [p];
        if (d.cardId !== 'new') {
          const c = await cards.get(d.cardId);
          favourite.current = !!c?.favourite;
          originalPhoto.current = c?.photoFile && c.thumbFile ? { photoFile: c.photoFile, thumbFile: c.thumbFile } : null;
        }
        // Everything restored counts as a change, so leaving asks before discarding.
        initial.current = 'recovered';
      } else if (cardId) {
        const c = await cards.get(cardId);
        if (!alive) return;
        if (c) {
          setSymbolId(c.item?.symbolId ?? null);
          setBadges(c.item?.badges ?? []);
          setLabel(c.label);
          setShowLabel(c.showLabel);
          setCategoryId(c.categoryId);
          setCategoryTouched(true);
          favourite.current = c.favourite;
          if (c.photoFile && c.thumbFile) {
            const p = { photoFile: c.photoFile, thumbFile: c.thumbFile };
            setPhoto(p);
            originalPhoto.current = p;
          }
          initial.current = JSON.stringify({ symbolId: c.item?.symbolId ?? null, badges: c.item?.badges ?? [], label: c.label, showLabel: c.showLabel, categoryId: c.categoryId, photo: c.photoFile });
        }
      } else {
        initial.current = JSON.stringify({ symbolId: null, badges: [], label: '', showLabel: false, categoryId: CARD_CATEGORY_KEYS[0], photo: null });
      }
      if (alive) setLoaded(true);
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    void categories.list().then(setAllCats);
  }, [categories]);

  const dirty = loaded && snapshot() !== initial.current;

  useEffect(() => {
    navigation.setOptions({ title: cardId ? t('ui.editor.title.edit') : t('ui.editor.title.new') });
  }, [navigation, cardId]);

  const discardNewFiles = useCallback(() => {
    for (const f of addedFiles.current) deletePhotoFiles(f.photoFile, f.thumbFile);
    addedFiles.current = [];
    void settings.remove(DRAFT_SETTING_KEY);
  }, [settings]);

  // Leaving without saving: ask first when something changed; either way remove photos added in this session.
  useEffect(() => {
    const sub = navigation.addListener('beforeRemove', (e) => {
      if (allowLeave.current) return;
      if (!dirty) {
        discardNewFiles();
        return;
      }
      e.preventDefault();
      Alert.alert(t('ui.editor.discard.title'), t('ui.editor.discard.body'), [
        { text: t('ui.editor.discard.no'), style: 'cancel' },
        {
          text: t('ui.editor.discard.yes'),
          style: 'destructive',
          onPress: () => {
            discardNewFiles();
            allowLeave.current = true;
            navigation.dispatch(e.data.action);
          },
        },
      ]);
    });
    return sub;
  }, [navigation, dirty, discardNewFiles]);

  // Keep the draft up to date while editing, so it is current when the camera or gallery opens.
  const currentDraft = useCallback(
    (): EditorDraft => ({
      cardId: cardId ?? 'new', symbolId, badges, label, showLabel, categoryId, categoryTouched,
      photoFile: photo?.photoFile ?? null, thumbFile: photo?.thumbFile ?? null,
    }),
    [cardId, symbolId, badges, label, showLabel, categoryId, categoryTouched, photo],
  );

  const pickSymbol = (id: string) => {
    const r = chooseMainSymbol(badges, id);
    setSymbolId(id);
    setBadges(r.badges);
    setNote(r.noRemoved ? t('ui.editor.noRemoved') : null);
    if (!categoryTouched) setCategoryId(defaultCategoryFor(id, categoryId));
  };

  const attach = useCallback(async (asset: { uri: string; width: number; height: number }) => {
    setBusy(true);
    try {
      const imported = await importPhoto(asset);
      const prev = photo;
      if (prev && addedFiles.current.some((f) => f.photoFile === prev.photoFile)) {
        deletePhotoFiles(prev.photoFile, prev.thumbFile); // a photo added earlier in this session and now replaced
        addedFiles.current = addedFiles.current.filter((f) => f.photoFile !== prev.photoFile);
      }
      const p = { photoFile: imported.photoFile, thumbFile: imported.thumbFile };
      addedFiles.current.push(p);
      setPhoto(p);
      setPhotoInfo(imported.info);
    } catch {
      Alert.alert(t('ui.photo.error'));
    } finally {
      setBusy(false);
    }
  }, [photo]);

  const handleOutcome = useCallback(async (o: PickOutcome) => {
    if (o.status === 'ok') await attach(o.asset);
    else if (o.status === 'denied') Alert.alert(t('ui.photo.denied'));
    else if (o.status === 'error') Alert.alert(t('ui.photo.error'));
  }, [attach]);

  const openPicker = async (kind: 'camera' | 'gallery') => {
    // Written before the picker opens: if Android closes the app meanwhile, this is what gets restored.
    await settings.set(DRAFT_SETTING_KEY, serializeDraft(currentDraft()));
    await handleOutcome(kind === 'camera' ? await takePhoto() : await choosePhoto());
  };

  const removePhoto = () => {
    if (photo && addedFiles.current.some((f) => f.photoFile === photo.photoFile)) {
      deletePhotoFiles(photo.photoFile, photo.thumbFile);
      addedFiles.current = addedFiles.current.filter((f) => f.photoFile !== photo.photoFile);
    }
    setPhoto(null);
    setPhotoInfo(null);
  };

  const canSave = !!symbolId || !!photo;

  const save = async () => {
    if (!canSave) {
      Alert.alert(t('ui.editor.needSomething'));
      return;
    }
    setSaving(true);
    try {
      const input = {
        label, showLabel, categoryId, favourite: favourite.current,
        photoFile: photo?.photoFile ?? null, thumbFile: photo?.thumbFile ?? null,
        item: symbolId ? { symbolId, badges } : null,
      };
      if (cardId) {
        const freed = await cards.update(cardId, input);
        deletePhotoFiles(freed.photoFile, freed.thumbFile);
      } else {
        await cards.create(input);
      }
      await settings.remove(DRAFT_SETTING_KEY);
      addedFiles.current = [];
      allowLeave.current = true;
      if (needsSafetyReminder(badges, categoryId)) navigation.navigate('Home', { reminder: true });
      else navigation.goBack();
    } catch (e) {
      setSaving(false);
      Alert.alert(e instanceof CardValidationError ? t('ui.editor.needSomething') : t('ui.editor.saveFailed'));
    }
  };

  if (!loaded) return <View style={styles.screen} />;

  const photoCheck = photoInfo && photoInfo.valid
    ? t('ui.photo.check', {
        width: photoInfo.width,
        height: photoInfo.height,
        exif: photoInfo.hasExif ? t('ui.photo.check.exif') : t('ui.photo.check.noExif'),
        gps: photoInfo.hasGps ? t('ui.photo.check.gps') : t('ui.photo.check.noGps'),
        rotation: photoInfo.orientation && photoInfo.orientation !== 1 ? t('ui.photo.check.rotated', { value: photoInfo.orientation }) : t('ui.photo.check.upright'),
      })
    : null;

  return (
    <KeyboardAvoidingView style={styles.screen} behavior="padding">
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.preview}>
          {symbolId ? <CardView item={{ symbolId, badges }} size={120} /> : null}
          {photo ? <Image source={{ uri: thumbUri(photo.thumbFile) }} style={symbolId ? styles.previewPhoto : styles.previewPhotoOnly} resizeMode="contain" /> : null}
          {!symbolId && !photo ? <Text style={styles.previewEmpty}>{t('ui.editor.needSomething')}</Text> : null}
        </View>

        <Text style={styles.section}>{t('ui.editor.section.symbol')}</Text>
        <SymbolPicker selectedId={symbolId} onSelect={pickSymbol} showUnreviewed={SHOW_UNREVIEWED} />
        {note ? <Text style={styles.note}>{note}</Text> : null}

        <Text style={styles.section}>{t('ui.editor.section.modifiers')}</Text>
        <ModifierChips badges={badges} mainSymbolId={symbolId} onChange={setBadges} showUnreviewed={SHOW_UNREVIEWED} />

        <Text style={styles.section}>{t('ui.editor.section.photo')}</Text>
        <View style={styles.photoRow}>
          <TonalButton label={photo ? t('ui.editor.photo.change') : t('ui.editor.photo.add')} onPress={() => setPhotoSheet(true)} disabled={busy} />
          {busy ? <Text style={styles.muted}>{t('ui.editor.photo.working')}</Text> : null}
        </View>
        {photoCheck ? <Text style={styles.diag}>{photoCheck}</Text> : null}

        <Text style={styles.section}>{t('ui.editor.section.details')}</Text>
        <Text style={styles.fieldLabel}>{t('ui.editor.label')}</Text>
        <TextInput
          style={styles.input}
          value={label}
          onChangeText={setLabel}
          placeholder={t('ui.editor.labelHint')}
          placeholderTextColor={colors.onSurfaceMuted}
          maxLength={80}
          accessibilityLabel={t('ui.editor.label')}
        />
        <View style={styles.switchRow}>
          <Text style={styles.switchText}>{t('ui.editor.showLabel')}</Text>
          <Switch value={showLabel} onValueChange={setShowLabel} trackColor={{ true: colors.primary, false: colors.outline }} />
        </View>
        <Text style={styles.fieldLabel}>{t('ui.editor.category')}</Text>
        <View style={styles.catWrap}>
          {editorCategories(allCats, categoryId).map((c) => {
            const on = c.id === categoryId;
            return (
              <Pressable
                key={c.id}
                onPress={() => {
                  setCategoryId(c.id);
                  setCategoryTouched(true);
                }}
                style={[styles.catChip, on && styles.catChipOn]}
                accessibilityRole="button"
                accessibilityState={{ selected: on }}
              >
                <Text style={[styles.catText, on && styles.catTextOn]}>{categoryName(c)}</Text>
              </Pressable>
            );
          })}
          <Pressable onPress={() => setNewCat(true)} style={styles.catChip} accessibilityRole="button">
            <Text style={styles.catText}>{t('ui.editor.newCategory')}</Text>
          </Pressable>
        </View>
      </ScrollView>
      <View style={[styles.footer, { paddingBottom: spacing.lg + insets.bottom }]}>
        <FilledButton main label={t('ui.editor.save')} onPress={save} disabled={!canSave || saving || busy} style={styles.saveButton} />
      </View>
      <PromptDialog
        visible={newCat}
        title={t('ui.categories.new')}
        onCancel={() => setNewCat(false)}
        onSubmit={async (text) => {
          setNewCat(false);
          const id = await categories.create(text);
          setAllCats(await categories.list());
          if (id) {
            setCategoryId(id);
            setCategoryTouched(true);
          }
        }}
      />
      <Sheet
        visible={photoSheet}
        title={t('ui.editor.section.photo')}
        onClose={() => setPhotoSheet(false)}
        options={[
          { label: t('ui.editor.photo.take'), onPress: () => void openPicker('camera') },
          { label: t('ui.editor.photo.choose'), onPress: () => void openPicker('gallery') },
          ...(photo ? [{ label: t('ui.editor.photo.remove'), onPress: removePhoto, destructive: true }] : []),
        ]}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: 120 },
  preview: {
    backgroundColor: colors.surfaceVariant,
    borderRadius: radius.tile,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    minHeight: 144,
  },
  previewPhoto: { width: 96, height: 120, borderRadius: radius.small },
  previewPhotoOnly: { width: 200, height: 120, borderRadius: radius.small },
  previewEmpty: { ...type.body, color: colors.onSurfaceMuted },
  section: { ...type.titleMedium, color: colors.onSurface, marginTop: spacing.xl, marginBottom: spacing.sm },
  note: { ...type.caption, color: colors.onWarningContainer, backgroundColor: colors.warningContainer, padding: spacing.sm, borderRadius: radius.small, marginTop: spacing.sm },
  photoRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  muted: { ...type.caption, color: colors.onSurfaceMuted },
  diag: { ...type.caption, color: colors.onSurfaceMuted, marginTop: spacing.sm },
  fieldLabel: { ...type.caption, color: colors.onSurfaceMuted, marginTop: spacing.md, marginBottom: spacing.xs },
  input: { ...type.body, minHeight: 56, borderRadius: radius.cell, borderWidth: 1.5, borderColor: colors.outline, backgroundColor: colors.surface, paddingHorizontal: spacing.lg, color: colors.onSurface },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 56 },
  switchText: { ...type.body, color: colors.onSurface, flex: 1 },
  catWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  catChip: { minHeight: 40, paddingHorizontal: spacing.lg, borderRadius: radius.pill, borderWidth: 1.5, borderColor: colors.outline, backgroundColor: colors.surface, justifyContent: 'center' },
  catChipOn: { backgroundColor: colors.primaryContainer, borderColor: colors.primary, borderWidth: 2 },
  catText: { ...type.label, color: colors.onSurface },
  catTextOn: { color: colors.onPrimaryContainer },
  footer: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: spacing.lg, backgroundColor: colors.background },
  saveButton: { alignSelf: 'stretch' },
});
