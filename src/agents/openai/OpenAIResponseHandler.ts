import { json, text } from "express";
import OpenAI from "openai";
import { AssistantStream } from "openai/lib/AssistantStream";
import type { Channel, Event, MessageResponse, StreamChat } from "stream-chat";

export class OpenAIResponseHandler {
  //private → accessible only within the class.
  //declare variavle + constructor
  private message_text = "";
  private message_chunk = 0; //to track the no of text chuncks recieved - for monitoring & debugging
  private run_id = ""; //unique id for openai - req for generation
  private is_done = false; //flag to check the status / progress
  private last_update_time = 0;

  constructor(
    private readonly openai: OpenAI,
    private readonly openAiThread: OpenAI.Beta.Threads.Thread,
    private readonly assistantStream: AssistantStream,
    private readonly chatClient: StreamChat,
    private readonly channel: Channel,
    private readonly message: MessageResponse,
    private readonly onDisposel: () => void
  ) {
    this.chatClient.on("ai_indicator.stop", this.handleStopGenerating);
  }
  run = async () => {}; //orchestrator of the application
  dispose = async () => {
    if(this.is_done){
      return
    }
  };
  private handleStopGenerating = async (event: Event) => {};
  private handleStreamEvent = async (event: Event) => {};
  private handleError = async (error: Error) => {
    if (this.is_done) {
      return;
    }
    await this.channel.sendEvent({
      type: "ai_indicator.update",
      ai_state: "AI_STATE_ERROR",
      cid: this.message.cid,
      message_id: this.message.id,
    });
    await this.chatClient.partialUpdateMessage(this.message.id,{
        set:{
            text: error.message ?? "Error generating the message",
            message: error.toString(),
        }
    });
    await this.dispose();
  };

  private performWebSearch = async (query: string): Promise<string> => {
    const TAVILY_API_KEY = process.env.TAVILY_API_KEY;
    if (!TAVILY_API_KEY) {
      return JSON.stringify({
        error: "Web search is not available. API key not configured",
      });
    }
    console.log(`performing web search for ${query}`);
    try {
      const response = await fetch("https://api.tavily.com/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${TAVILY_API_KEY}`,
        },
        body: JSON.stringify({
          //sending
          query: query,
          search_depth: "advanced",
          max_results: 5,
          include_answer: true,
          include_raw_content: false,
        }),
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.log(`tavily search failed for query ${query}`, errorText);
        return JSON.stringify({
          error: `Search failed with status : ${response.status}`,
          details: errorText,
        });
      }
      const data = await response.json();
      console.log(`Tavily search successful for ${query}`);
      return JSON.stringify(data);
    } catch (error) {
      console.error(`An exception occurred during web search for ${query}`);
      return JSON.stringify({
        error: "An exception occurred during web search",
      });
    }
  };
}
