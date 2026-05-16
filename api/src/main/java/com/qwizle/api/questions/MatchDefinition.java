package com.qwizle.api.questions;

import java.util.List;

public record MatchDefinition(
        List<MatchItem> leftItems,
        List<MatchItem> rightItems,
        List<MatchPair> pairs) {
}
