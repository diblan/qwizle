package com.qwizle.api.questions;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

import org.springframework.stereotype.Component;

@Component
public class MultipleChoiceQuestionHandler extends QuestionHandlerSupport
        implements QuestionTypeHandler<MultipleChoiceDefinition, MultipleChoiceSubmission> {
    @Override
    public QuestionType type() {
        return QuestionType.MULTIPLE_CHOICE;
    }

    @Override
    public Class<MultipleChoiceDefinition> definitionClass() {
        return MultipleChoiceDefinition.class;
    }

    @Override
    public Class<MultipleChoiceSubmission> submissionClass() {
        return MultipleChoiceSubmission.class;
    }

    @Override
    public void validateDefinition(MultipleChoiceDefinition definition) {
        if (definition == null) {
            QuestionValidation.badRequest("Question definition is required.");
        }
        if (definition.selectionMode() == null) {
            QuestionValidation.badRequest("Multiple-choice selection mode is required.");
        }
        if (definition.options() == null || definition.options().size() < 2) {
            QuestionValidation.badRequest("Multiple-choice questions require at least two options.");
        }
        Set<String> optionIds = new LinkedHashSet<>();
        for (QuestionOption option : definition.options()) {
            String optionId = QuestionValidation.requireCleanText(option == null ? null : option.id(), "Option ID");
            if (!optionIds.add(optionId)) {
                QuestionValidation.badRequest("Option IDs must be unique.");
            }
            validateTextContent(option.content(), "Option");
        }
        validateCorrectOptionIds(definition, optionIds);
    }

    @Override
    public Object toLearnerInteraction(MultipleChoiceDefinition definition) {
        return new OptionSelectionInteraction("OPTION_SELECTION", definition.selectionMode(), definition.options());
    }

    @Override
    public void validateSubmission(MultipleChoiceDefinition definition, MultipleChoiceSubmission submission) {
        if (submission == null) {
            QuestionValidation.badRequest("Question response is required.");
        }
        if (submission.selectedOptionIds() == null || submission.selectedOptionIds().isEmpty()) {
            QuestionValidation.badRequest("Select at least one option.");
        }
        Set<String> optionIds = optionIds(definition.options());
        Set<String> selectedIds = new LinkedHashSet<>();
        for (String selectedOptionId : submission.selectedOptionIds()) {
            String cleanId = QuestionValidation.requireCleanText(selectedOptionId, "Selected option ID");
            if (!optionIds.contains(cleanId)) {
                QuestionValidation.badRequest("Selected option IDs must belong to the question.");
            }
            if (!selectedIds.add(cleanId)) {
                QuestionValidation.badRequest("Selected option IDs must be unique.");
            }
        }
        if (definition.selectionMode() == ChoiceSelectionMode.SINGLE && selectedIds.size() != 1) {
            QuestionValidation.badRequest("Select exactly one option.");
        }
    }

    @Override
    public ScoringResult score(MultipleChoiceDefinition definition, MultipleChoiceSubmission submission) {
        Set<String> expected = new LinkedHashSet<>(definition.correctOptionIds());
        Set<String> selected = new LinkedHashSet<>(submission.selectedOptionIds());
        boolean correct = expected.equals(selected);
        return ScoringResult.allOrNothing(correct, new MultipleChoiceSolution(type(), definition.correctOptionIds()));
    }

    private void validateCorrectOptionIds(MultipleChoiceDefinition definition, Set<String> optionIds) {
        if (definition.correctOptionIds() == null || definition.correctOptionIds().isEmpty()) {
            QuestionValidation.badRequest("At least one correct option is required.");
        }
        Set<String> correctIds = new LinkedHashSet<>();
        for (String correctOptionId : definition.correctOptionIds()) {
            String cleanId = QuestionValidation.requireCleanText(correctOptionId, "Correct option ID");
            if (!optionIds.contains(cleanId)) {
                QuestionValidation.badRequest("Correct option IDs must belong to the question.");
            }
            if (!correctIds.add(cleanId)) {
                QuestionValidation.badRequest("Correct option IDs must be unique.");
            }
        }
        if (definition.selectionMode() == ChoiceSelectionMode.SINGLE && correctIds.size() != 1) {
            QuestionValidation.badRequest("Single-choice questions require exactly one correct option.");
        }
    }

    private Set<String> optionIds(List<QuestionOption> options) {
        Set<String> ids = new LinkedHashSet<>();
        for (QuestionOption option : options) {
            ids.add(option.id());
        }
        return ids;
    }
}
