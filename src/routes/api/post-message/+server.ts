import { PRIVATE_OPENAI_KEY, PRIVATE_ASSISTANT_ID, PRIVATE_GOOGLE_API_KEY } from "$env/static/private";
import { PUBLIC_RECAPTCHA_KEY } from "$env/static/public";
import { error } from "@sveltejs/kit";
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: PRIVATE_OPENAI_KEY
});

const SCORE_THRESHOLD = 0.8;
export async function POST({ request }){

    const body = await request.json();

    // Recaptcha validation

    const recaptchaObject = {
        event: {
            token: body.token,
            expectedAction: body.expectedAction,
            siteKey: PUBLIC_RECAPTCHA_KEY,
        }
    }

    const recaptchaResponse = await fetch(`https://recaptchaenterprise.googleapis.com/v1/projects/maruta-assistant-1717361969774/assessments?key=${PRIVATE_GOOGLE_API_KEY}`, {
        method: "POST",
        body: JSON.stringify(recaptchaObject)
    });

    if(recaptchaResponse.status !== 200) error(400, "Did not complete Recaptcha");

    const recaptchaJson = await recaptchaResponse.json();

    if(recaptchaJson.riskAnalysis.score < SCORE_THRESHOLD) error(400, "Did not pass Recaptcha test");

    // OpenAI API
    const messages = body.messageFeed;
    const assistant = await openai.beta.assistants.retrieve(PRIVATE_ASSISTANT_ID);

    const thread = await openai.beta.threads.create();

    const userQuestion = messages.at(-1);

    

    const message = await openai.beta.threads.messages.create(
        thread.id,
        {
            role: "user",
            content: userQuestion ? userQuestion.message : ""
        }
    );


    // We use the stream SDK helper to create a run with
    // streaming. The SDK provides helpful event listeners to handle 
    // the streamed response.
 
    const stream = await openai.beta.threads.runs.create(thread.id, 
        { assistant_id: assistant.id, stream: true}
    )

    return new Response(
        stream.toReadableStream(),
        {
            headers: {
                "Content-Type": "text/event-stream"
            }
        }
    );

}