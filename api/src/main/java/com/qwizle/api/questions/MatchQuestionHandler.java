package com.qwizle.api.questions;

import java.util.LinkedHashSet;
import java.util.Set;

import org.springframework.stereotype.Component;

@Component
public class MatchQuestionHandler extends QuestionHandlerSupport
        implements QuestionTypeHandler<MatchDefinition, MatchSubmission> {
    @Override
    public QuestionType type() {
        return QuestionType.MATCH;
    }

    @Override
    public Class<MatchDefinition> definitionClass() {
        return MatchDefinition.class;
    }

    @Override
    public Class<MatchSubmission> submissionClass() {
        return MatchSubmission.class;
    }

    @Override
    public void validateDefinition(MatchDefinition definition) {
        if (definition == null) {
            QuestionValidation.badRequest("Question definition is required.");
        }
        Set<String> leftIds = validateItems(definition.leftItems(), "Left");
        Set<String> rightIds = validateItems(definition.rightItems(), "Right");
        if (leftIds.size() < 2 || rightIds.size() < 2) {
            QuestionValidation.badRequest("Match questions require at least two left and two right items.");
        }
        if (definition.pairs() == null || definition.pairs().size() != leftIds.size()) {
            QuestionValidation.badRequest("Match questions require one pair for each left item.");
        }
        validatePairs(definition.pairs(), leftIds, rightIds);
    }

    @Override
    public Object toLearnerInteraction(MatchDefinition definition) {
        return new MatchingInteraction("MATCHING", definition.leftItems(), definition.rightItems());
    }

    @Override
    public void validateSubmission(MatchDefinition definition, MatchSubmission submission) {
        if (submission == null) {
            QuestionValidation.badRequest("Question response is required.");
        }
        Set<String> leftIds = itemIds(definition.leftItems());
        Set<String> rightIds = itemIds(definition.rightItems());
        if (submission.pairs() == null || submission.pairs().size() != leftIds.size()) {
            QuestionValidation.badRequest("Submit one match for each left item.");
        }
        validatePairs(submission.pairs(), leftIds, rightIds);
    }

    @Override
    public ScoringResult score(MatchDefinition definition, MatchSubmission submission) {
        Set<String> expected = pairKeys(definition.pairs());
        Set<String> submitted = pairKeys(submission.pairs());
        boolean correct = expected.equals(submitted);
        return ScoringResult.allOrNothing(correct, new MatchSolution(type(), definition.pairs()));
    }

    private Set<String> validateItems(java.util.List<MatchItem> items, String sideName) {
        if (items == null || items.isEmpty()) {
            QuestionValidation.badRequest(sideName + " items are required.");
        }
        Set<String> itemIds = new LinkedHashSet<>();
        for (MatchItem item : items) {
            String itemId = QuestionValidation.requireCleanText(item == null ? null : item.id(), sideName + " item ID");
            if (!itemIds.add(itemId)) {
                QuestionValidation.badRequest(sideName + " item IDs must be unique.");
            }
            validateTextContent(item.content(), sideName + " item");
        }
        return itemIds;
    }

    private Set<String> itemIds(java.util.List<MatchItem> items) {
        Set<String> ids = new LinkedHashSet<>();
        for (MatchItem item : items) {
            ids.add(item.id());
        }
        return ids;
    }

    private void validatePairs(java.util.List<MatchPair> pairs, Set<String> leftIds, Set<String> rightIds) {
        Set<String> pairedLeftIds = new LinkedHashSet<>();
        for (MatchPair pair : pairs) {
            String leftId = QuestionValidation.requireCleanText(pair == null ? null : pair.leftId(), "Match left ID");
            String rightId = QuestionValidation.requireCleanText(pair == null ? null : pair.rightId(), "Match right ID");
            if (!leftIds.contains(leftId) || !rightIds.contains(rightId)) {
                QuestionValidation.badRequest("Match pair IDs must belong to the question.");
            }
            if (!pairedLeftIds.add(leftId)) {
                QuestionValidation.badRequest("Each left item can be matched only once.");
            }
        }
    }

    private Set<String> pairKeys(java.util.List<MatchPair> pairs) {
        Set<String> keys = new LinkedHashSet<>();
        for (MatchPair pair : pairs) {
            keys.add(pair.leftId() + "\u0000" + pair.rightId());
        }
        return keys;
    }
}
