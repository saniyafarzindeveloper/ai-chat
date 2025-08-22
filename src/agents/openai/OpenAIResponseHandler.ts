import OpenAI from "openai";
import { AssistantStream } from "openai/lib/AssistantStream";
import type { Channel, Event, MessageResponse, StreamChat } from "stream-chat";

export class OpenAIResponseHandler {
    //private → accessible only within the class.
    //declare variavle + constructor
    private message_text = ""
    private message_chunk = 0 //to track the no of text chuncks recieved - for monitoring & debugging
    private run_id = "" //unique id for openai - req for generation
    private is_done = false //flag to check the status / progress
    private last_update_time = 0

    constructor(
        private readonly openai : OpenAI,
        private readonly openAiThread : OpenAI.Beta.Threads.Thread,
        private readonly assistantStream : AssistantStream,
        private readonly chatClient :  StreamChat,
        private readonly channel: Channel,
        private readonly message: MessageResponse,
        private readonly onDisposel : () => void,
    ){
        this.chatClient.on("ai_indicator.stop", this.handleStopGenerating)
    }
    run = async() => {} //orchestrator of the application
    dispose = async() => {}
    private handleStopGenerating = async(event: Event) => {}
    
}