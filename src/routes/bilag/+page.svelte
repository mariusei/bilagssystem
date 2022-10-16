<script lang="ts">
	import type { PageData, ActionData } from './$types';

	export let data: PageData;

	//export let form: ActionData;

	/** Whether or not the user has won */
	//$: won = data.answers.at(-1) === 'xxxxx';


</script>

<h1>Test!</h1>
<p>Result: {data.res}</p>