package com.kayalmart.dto;

import java.util.List;

/** Response body from the OpenAI Chat Completions API. */
public record OpenAiChatResponse(
        List<Choice> choices
) {
    public record Choice(Message message) {
    }

    public record Message(String role, String content) {
    }
}
