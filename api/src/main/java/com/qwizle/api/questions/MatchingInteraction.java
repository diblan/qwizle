package com.qwizle.api.questions;

import java.util.List;

public record MatchingInteraction(
        String kind,
        List<MatchItem> leftItems,
        List<MatchItem> rightItems) {
}
