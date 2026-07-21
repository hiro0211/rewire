import { pickOnboardingSurveyAnswers } from '../onboardingSurveyAnswers';

const COMPLETE = {
  age_range: '25-34',
  discovery_channel: 'tiktok',
  motivation: 'self_control',
};

describe('pickOnboardingSurveyAnswers', () => {
  it('調査3問だけを抜き出す（assessment の回答は混ぜない）', () => {
    const answers = { ...COMPLETE, startAge: 'under12', currentAge: '25' };
    expect(pickOnboardingSurveyAnswers(answers, false)).toEqual(COMPLETE);
  });

  it('スキップされた場合は空を返す（送信しないため）', () => {
    expect(pickOnboardingSurveyAnswers(COMPLETE, true)).toEqual({});
  });

  it('必須3問が揃っていない場合は空を返す', () => {
    const { motivation, ...partial } = COMPLETE;
    expect(pickOnboardingSurveyAnswers(partial, false)).toEqual({});
  });

  it('空文字の回答は未回答として扱う', () => {
    expect(pickOnboardingSurveyAnswers({ ...COMPLETE, age_range: '' }, false)).toEqual({});
  });

  it('何も回答がない場合は空を返す', () => {
    expect(pickOnboardingSurveyAnswers({}, false)).toEqual({});
  });
});
