package com.qwizle.api.questions;

import java.util.List;

public record MultipleChoiceSubmission(List<String> selectedOptionIds) {
}
