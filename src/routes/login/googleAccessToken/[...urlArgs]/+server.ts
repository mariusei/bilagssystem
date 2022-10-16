
import type { RequestHandler } from './$types';
import { json }  from '@sveltejs/kit';
import { google } from 'googleapis';
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI_SVELTE } from '$env/static/private';

const oauth2Client = new google.auth.OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI_SVELTE 
);

export const GET: RequestHandler = async (req) => {
    console.log("hello! url: " + String(req))

    //console.log("oauth2callback valid? ", req.url.searchParams.has("oauth2callback"))

    return json("test" + String(req.params.urlArgs))

    // urlSearchParams get ('code')


}