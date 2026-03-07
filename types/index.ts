export type SessionType = 'appearance' | 'voice' | 'date_prep' | 'chat_coach';

export interface UserProfile {
  id: string;
  user_id: string;
  big_five: {
    openness: number;
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
  };
  style_preference: 'classic' | 'smart-casual' | 'streetwear' | 'bold' | 'minimalist';
  goals: string[];
  onboarding_completed: boolean;
  created_at: string;
}

export interface AppearanceData {
  imageBase64: string;
  notes?: string;
}

export interface AppearanceResult {
  faceShape: string;
  skinTone: string;
  expressionScore: number;
  postureScore: number;
  hairstyleRecommendations: string[];
  clothingColors: string[];
  groomingTips: string[];
  postureCorrections: string[];
  expressionTips: string[];
  overallCoaching: string;
}

export interface VoiceData {
  transcript: string;
  durationSeconds: number;
}

export interface VoiceResult {
  fillerWordCount: number;
  fillerWords: { word: string; count: number }[];
  grammarIssues: { original: string; suggestion: string; explanation: string }[];
  paceWpm: number;
  clarityScore: number;
  toneAssessment: string;
  strengthsList: string[];
  improvementsList: string[];
  exercises: string[];
  overallCoaching: string;
}

export interface DatePrepData {
  aboutMe: {
    communicationStyle: string;
    nervousAbout: string;
    pastChallenge: string;
    personalitySnapshot: string;
  };
  aboutThem: {
    interests: string;
    vibe: string;
    profession: string;
    whereYouMet: string;
  };
  occasion: {
    type: string;
    location: string;
    timeOfDay: string;
  };
}

export interface DatePrepResult {
  whatToWear: string;
  howToOpen: string;
  conversationStarters: string[];
  bodyLanguageTips: string[];
  thingsToAvoid: string[];
  nervousnessStrategy: string;
  overallCoaching: string;
}

export interface AnalysisSession {
  id: string;
  user_id: string;
  session_type: SessionType;
  appearance_data: AppearanceData | null;
  appearance_result: AppearanceResult | null;
  voice_data: VoiceData | null;
  voice_result: VoiceResult | null;
  date_prep_data: DatePrepData | null;
  date_prep_result: DatePrepResult | null;
  appearance_score: number | null;
  voice_score: number | null;
  social_score: number | null;
  created_at: string;
}

export interface PresenceScore {
  id: string;
  user_id: string;
  date: string;
  appearance_score: number | null;
  voice_score: number | null;
  social_score: number | null;
  composite_score: number;
}

export type ChatIntention =
  | 'keep_it_fun'
  | 'build_connection'
  | 'romantic_escalate'
  | 'get_a_date'
  | 're_engage';

export interface ChatCoachData {
  chatText: string;
  platform: 'instagram' | 'whatsapp' | 'other';
  yourName: string;
  intention: ChatIntention;
}

export interface SuggestedReply {
  message: string;
  tone: string;
  reasoning: string;
}

export interface ChatCoachResult {
  yourPersonality: {
    summary: string;
    strengths: string[];
    blindSpots: string[];
  };
  theirPersonality: {
    summary: string;
    whatTheyRespondTo: string[];
    redFlags: string[];
  };
  dynamic: string;
  interestLevel: number;
  suggestedReplies: SuggestedReply[];
  doList: string[];
  dontList: string[];
  overallRead: string;
}

export interface QuizQuestion {
  id: string;
  text: string;
  options: { label: string; value: string }[];
  category: 'big_five' | 'style' | 'goals';
  trait?: keyof UserProfile['big_five'];
}
