import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { OnboardingStepRenderer } from '../OnboardingStepRenderer';

jest.mock('@/components/onboarding/steps/WelcomeStep', () => ({
  WelcomeStep: ({ onStart }: any) => {
    const { Text } = require('react-native');
    return <Text testID="welcome-step">WelcomeStep</Text>;
  },
}));

jest.mock('@/components/onboarding/ScoreResultStep', () => ({
  ScoreResultStep: () => {
    const { Text } = require('react-native');
    return <Text testID="score-result-step">ScoreResultStep</Text>;
  },
}));

jest.mock('@/components/onboarding/AnalyzingStep', () => ({
  AnalyzingStep: () => {
    const { Text } = require('react-native');
    return <Text testID="analyzing-step">AnalyzingStep</Text>;
  },
}));

jest.mock('@/components/onboarding/steps/NicknameStep', () => ({
  NicknameStep: () => {
    const { Text } = require('react-native');
    return <Text testID="nickname-step">NicknameStep</Text>;
  },
}));

jest.mock('@/components/onboarding/steps/FeaturesStep', () => ({
  FeaturesStep: () => {
    const { Text } = require('react-native');
    return <Text testID="features-step">FeaturesStep</Text>;
  },
}));

jest.mock('@/components/onboarding/steps/ConsentStep', () => ({
  ConsentStep: () => {
    const { Text } = require('react-native');
    return <Text testID="consent-step">ConsentStep</Text>;
  },
}));

jest.mock('@/components/onboarding/AssessmentChoiceStep', () => ({
  AssessmentChoiceStep: () => {
    const { Text } = require('react-native');
    return <Text testID="choice-step">AssessmentChoiceStep</Text>;
  },
}));

jest.mock('@/components/onboarding/OnboardingSurveyChoiceStep', () => ({
  OnboardingSurveyChoiceStep: ({ question, onSelect }: any) => {
    const { Text } = require('react-native');
    return (
      <Text testID="onboarding-survey-step" onPress={() => onSelect('tiktok')}>
        {question.id}
      </Text>
    );
  },
}));

jest.mock('@/components/onboarding/AssessmentPickerStep', () => ({
  AssessmentPickerStep: () => {
    const { Text } = require('react-native');
    return <Text testID="picker-step">AssessmentPickerStep</Text>;
  },
}));

jest.mock('@/components/onboarding/AssessmentYesNoStep', () => ({
  AssessmentYesNoStep: () => {
    const { Text } = require('react-native');
    return <Text testID="yesno-step">AssessmentYesNoStep</Text>;
  },
}));

jest.mock('@/components/onboarding/SymptomSelectStep', () => ({
  SymptomSelectStep: () => {
    const { Text } = require('react-native');
    return <Text testID="symptom-step">SymptomSelectStep</Text>;
  },
}));

jest.mock('@/components/onboarding/EducationSlideStep', () => ({
  EducationSlideStep: () => {
    const { Text } = require('react-native');
    return <Text testID="education-step">EducationSlideStep</Text>;
  },
}));

jest.mock('@/components/onboarding/TransitionSlideStep', () => ({
  TransitionSlideStep: () => {
    const { Text } = require('react-native');
    return <Text testID="transition-step">TransitionSlideStep</Text>;
  },
}));

jest.mock('@/components/onboarding/NotificationSetupStep', () => ({
  NotificationSetupStep: () => {
    const { Text } = require('react-native');
    return <Text testID="notification-step">NotificationSetupStep</Text>;
  },
}));

jest.mock('@/components/onboarding/LastViewedDateStep', () => ({
  LastViewedDateStep: () => {
    const { Text } = require('react-native');
    return <Text testID="last-viewed-step">LastViewedDateStep</Text>;
  },
}));

const defaultProps = {
  form: {
    nickname: '',
    setNickname: jest.fn(),
    privacyAgreed: false,
    togglePrivacyAgreed: jest.fn(),
    dataAgreed: false,
    toggleDataAgreed: jest.fn(),
    answers: {} as Record<string, string>,
    setAnswer: jest.fn(),
    selectedSymptoms: [] as string[],
    toggleSymptom: jest.fn(),
    notifyTime: '22:00',
    setNotifyTime: jest.fn(),
    lastViewedYear: 2026,
    setLastViewedYear: jest.fn(),
    lastViewedMonth: 1,
    setLastViewedMonth: jest.fn(),
    lastViewedDay: 1,
    setLastViewedDay: jest.fn(),
  },
  onAssessmentAnswer: jest.fn(),
  onSurveyAnswer: jest.fn(),
  onPickerSelect: jest.fn(),
  onAutoAdvance: jest.fn(),
};

describe('OnboardingStepRenderer', () => {
  it('welcome タイプで WelcomeStep をレンダリングする', () => {
    const { getByTestId } = render(
      <OnboardingStepRenderer currentStep={{ type: 'welcome' }} {...defaultProps} />,
    );
    expect(getByTestId('welcome-step')).toBeTruthy();
  });

  it('features タイプで FeaturesStep をレンダリングする', () => {
    const { getByTestId } = render(
      <OnboardingStepRenderer currentStep={{ type: 'features' }} {...defaultProps} />,
    );
    expect(getByTestId('features-step')).toBeTruthy();
  });

  it('nickname タイプで NicknameStep をレンダリングする', () => {
    const { getByTestId } = render(
      <OnboardingStepRenderer currentStep={{ type: 'nickname' }} {...defaultProps} />,
    );
    expect(getByTestId('nickname-step')).toBeTruthy();
  });

  it('analyzing タイプで AnalyzingStep をレンダリングする', () => {
    const { getByTestId } = render(
      <OnboardingStepRenderer currentStep={{ type: 'analyzing' }} {...defaultProps} />,
    );
    expect(getByTestId('analyzing-step')).toBeTruthy();
  });

  it('onboarding_survey_choice タイプで OnboardingSurveyChoiceStep をレンダリングする', () => {
    const { getByTestId } = render(
      <OnboardingStepRenderer
        currentStep={{ type: 'onboarding_survey_choice', questionId: 'discovery_channel' }}
        {...defaultProps}
      />,
    );
    expect(getByTestId('onboarding-survey-step')).toBeTruthy();
    expect(getByTestId('onboarding-survey-step').props.children).toBe('discovery_channel');
  });

  it('onboarding_survey_choice の選択で onSurveyAnswer が questionId 付きで呼ばれる', () => {
    const onSurveyAnswer = jest.fn();
    const { getByTestId } = render(
      <OnboardingStepRenderer
        currentStep={{ type: 'onboarding_survey_choice', questionId: 'discovery_channel' }}
        {...defaultProps}
        onSurveyAnswer={onSurveyAnswer}
      />,
    );
    fireEvent.press(getByTestId('onboarding-survey-step'));
    expect(onSurveyAnswer).toHaveBeenCalledWith('discovery_channel', 'tiktok');
  });

  it('damage_intro タイプで TransitionSlideStep をレンダリングする', () => {
    const { getByTestId } = render(
      <OnboardingStepRenderer currentStep={{ type: 'damage_intro' }} {...defaultProps} />,
    );
    expect(getByTestId('transition-step')).toBeTruthy();
  });

});
