import type { PageServerLoad, Actions } from './$types';
import { google } from 'googleapis';
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI_SVELTE } from '$env/static/private';

const oauth2Client = new google.auth.OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI_SVELTE 
);


const scopes = ["profile", "https://www.googleapis.com/auth/drive"] 

export const actions: Actions = {

}