package com.qwizle.api.questions;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ContentBlock(
        @NotNull(message = "Content kind is required.")
        ContentKind kind,

        @Size(max = 1000, message = "Content text must be 1000 characters or fewer.")
        String text,

        @Size(max = 1000, message = "Content URL must be 1000 characters or fewer.")
        String url,

        @Size(max = 240, message = "Alt text must be 240 characters or fewer.")
        String altText) {
}
