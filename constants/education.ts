export interface EducationSlide {
  id: string;
  title: string;
  body: string;
  illustrationType:
    | 'dopamine_bars' | 'lock_icon' | 'dimmed_icons' | 'recovery_progress'
    | 'scattered_focus' | 'shame_cycle' | 'isolation'
    | 'brain_sparkle' | 'vibrant_life';
}

export const EDUCATION_SLIDES: EducationSlide[] = [
  {
    id: 'dopamine_trap',
    title: 'なぜ「やめよう」と思っても\n見てしまうのか',
    body: 'ポルノは脳内に異常な量のドーパミンを放出させます。脳がこの強烈な快感を覚えると、「もっと見たい」という衝動が抑えられなくなります。',
    illustrationType: 'dopamine_bars',
  },
  {
    id: 'not_willpower',
    title: 'あなたの意志が\n弱いわけではない',
    body: '脳には生存に必要な行動を繰り返させる「報酬系」という回路があります。ポルノはこの回路をハックし、理性を司る前頭葉の働きを鈍らせます。',
    illustrationType: 'lock_icon',
  },
  {
    id: 'daily_impact',
    title: '日常から輝きが\n失われていく',
    body: 'ドーパミンの基準値が上がった脳は、日常の小さな幸せを感じるセンサーが鈍ります。「何をやっても楽しくない」「集中できない」——これは脳の変化が原因です。',
    illustrationType: 'dimmed_icons',
  },
];

export const DAMAGE_SLIDES: EducationSlide[] = [
  {
    id: 'focus_collapse',
    title: '集中力と意欲が\n奪われていく',
    body: 'ドーパミンの基準値が上がりきった脳は、地道な作業に価値を感じられなくなります。頭にモヤがかかったような状態が続き、先延ばしが止まらなくなります。',
    illustrationType: 'scattered_focus',
  },
  {
    id: 'shame_cycle',
    title: '「またやってしまった…」\nその繰り返し',
    body: '視聴後の強い自己嫌悪と罪悪感は心に蓄積します。自信が失われ、人と目を合わせるのが怖くなり、不安やうつ症状につながることが研究で示されています。',
    illustrationType: 'shame_cycle',
  },
  {
    id: 'isolation',
    title: '人とのつながりが\n遠ざかっていく',
    body: '画面の中で欲求が満たされると、現実の人間関係を築く努力が面倒に感じられます。孤立が深まるほど、さらに画面に逃げる悪循環に陥ります。',
    illustrationType: 'isolation',
  },
];

export const RECOVERY_SLIDES: EducationSlide[] = [
  {
    id: 'neuroplasticity',
    title: '脳には自ら\n変わる力がある',
    body: '人間の脳には「神経可塑性」という、環境に合わせて自らの構造を変化させる能力があります。ポルノを断つことで、ドーパミンの基準値は徐々に正常に戻ります。',
    illustrationType: 'brain_sparkle',
  },
  {
    id: 'bright_future',
    title: '本来の感覚を\n取り戻していく',
    body: '1〜3ヶ月で集中力が戻り始め、3〜6ヶ月で衝動は大幅に減少します。仕事への没頭、人との会話の楽しさ、朝のクリアな頭——あなた本来の力が戻ってきます。',
    illustrationType: 'vibrant_life',
  },
];

