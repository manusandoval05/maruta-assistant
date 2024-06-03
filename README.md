# create-svelte

Everything you need to build a Svelte project, powered by [`create-svelte`](https://github.com/sveltejs/kit/tree/main/packages/create-svelte).

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```
## Configuring environment variables

There are four essential environment variables for the website to run properly. Three private and one public key.

* PRIVATE_OPENAI_KEY: API key provided by OpenAI
* PRIVATE_ASSISTANT_ID: Specific ID of the assistant with the linked vectorized database of the road map document
* PRIVATE_GOOGLE_API_KEY: API key from the Google Cloud console to handle the ReCAPCTHA traffic
* PUBLIC_RECAPTCHA_KEY: Project public key that links the page with the ReCAPTCHA instance

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://kit.svelte.dev/docs/adapters) for your target environment.
