package com.kayalmart.dto;

/** A single message in an OpenAI conversation. */
public record OpenAiMessage(
        String role,
        String content
) {
}
