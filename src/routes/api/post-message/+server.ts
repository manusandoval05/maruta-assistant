import { PRIVATE_OPENAI_KEY, PRIVATE_ASSISTANT_ID } from "$env/static/private";
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: PRIVATE_OPENAI_KEY
});
export async function POST({ request }){

    const body = await request.json();
    const messages = body.messageFeed;
    const assistant = await openai.beta.assistants.retrieve(PRIVATE_ASSISTANT_ID);

    const thread = await openai.beta.threads.create();

    const userQuestion = messages.at(-1);
    const message = await openai.beta.threads.messages.create(
        thread.id,
        {
            role: "user",
            content: userQuestion ? userQuestion.content : ""
        }
    )

    // We use the stream SDK helper to create a run with
    // streaming. The SDK provides helpful event listeners to handle 
    // the streamed response.
    let { readable, writable } = new TransformStream(); 
    const writer = writable.getWriter();
    // We use the stream SDK helper to create a run with
// streaming. The SDK provides helpful event listeners to handle 
// the streamed response.
 
    const run = openai.beta.threads.runs.stream(thread.id, {
        assistant_id: assistant.id
    })
    .on('textCreated', (text) => {
        writer.write({ event: 'textCreated', data: { message: 'assistant > ' } });
    })
    .on('textDelta', (textDelta, snapshot) => {
        writer.write({ event: 'textDelta', data: { message: textDelta.value } });
    })
    .on('toolCallCreated', (toolCall) => {
        writer.write({ event: 'toolCallCreated', data: { message: `assistant > ${toolCall.type}` } });
    })
    .on('toolCallDelta', (toolCallDelta, snapshot) => {
        if (toolCallDelta.type === 'code_interpreter') {
            if (toolCallDelta.code_interpreter.input) {
                writer.write({ event: 'toolCallDelta', data: { message: toolCallDelta.code_interpreter.input } });
            }
            if (toolCallDelta.code_interpreter.outputs) {
                writer.write({ event: 'toolCallDelta', data: { message: "output >\n" } });
                toolCallDelta.code_interpreter.outputs.forEach(output => {
                    if (output.type === "logs") {
                        writer.write({ event: 'toolCallDelta', data: { message: output.logs } });
                    }
                });
            }
        }
    });

    return new Response(
        readable,
        {
            headers: {
                "Content-Type": "text/event-stream"
            }
        }
    );

}