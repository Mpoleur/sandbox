import Constants from 'expo-constants';

/** True only in the review build (com.poleur.cards.review), which shows the 10 culture-check symbols with a mark. */
export const SHOW_UNREVIEWED: boolean = Constants.expoConfig?.extra?.showUnreviewed === true;
