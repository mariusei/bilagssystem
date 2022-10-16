
import type { PageServerLoad, Actions } from './$types';

// On load:
// Check if Google Auth token is present, if not, send to login
export const load: PageServerLoad = ({ cookies }) => {
	const token = cookies.get('google_auth');

	return {res: token ? "yes: " + String(token) : "no, see: " + String(token)}
}