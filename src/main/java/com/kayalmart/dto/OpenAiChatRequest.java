package com.kayalmart.dto;

import java.util.List;

/** Request body for the OpenAI Chat Completions API. */
public record OpenAiChatRequest(
        String model,
        List<OpenAiMessage> messages,
        Double temperature,
        Integer maxTokens
) {
}
