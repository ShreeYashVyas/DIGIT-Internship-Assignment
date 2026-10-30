import { useCallback, useEffect, useState } from 'react';
import {
  ArrowLeft, ArrowRight, BookOpen, Brain, Check, CheckCircle2, ChevronRight,
  CircleHelp, Clock3, Flame, GraduationCap, LayoutDashboard, LoaderCircle,
  LogOut, Play, RefreshCw, Sparkles, Target, TrendingUp, Trophy, XCircle
} from 'lucide-react';
import { getHealth, getProgress, startQuiz, submitAnswer } from './api';

const STUDENT_ID = 'demo-student';
const dateLabel = (value) => value ? new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

function StatCard({ icon: Icon, label, value, note, tone }) {
  return <div className={'stat-card ' + tone}><div className="stat-icon"><Icon size={19} /></div><div className="stat-label">{label}</div><div className="stat-value">{value}</div><div className="stat-note">{note}</div></div>;
}

function EmptyState({ onStart }) {
  return <div className="empty-state"><div className="empty-icon"><Brain size={28} /></div><h3>Your learning journey starts here</h3><p>Complete your first adaptive quiz to unlock topic insights and personalized recommendations.</p><button className="primary-button" onClick={onStart}><Play size={16} /> Start your first quiz</button></div>;
}

function Dashboard({ progress, onStart, onRefresh, loading }) {
  const overview = progress?.overview || {};
  const topics = progress?.topicStats || [];
  const suggestions = progress?.recommendations || [];
  const attempts = progress?.recentAttempts || [];
  return <div className="page-content">
    <section className="welcome-row"><div><div className="eyebrow"><Sparkles size={14} /> YOUR LEARNING SPACE</div><h1>Good to see you, Learner <span className="wave">✦</span></h1><p>Small steps every day lead to stronger skills. Ready for today's challenge?</p></div><button className="primary-button" onClick={onStart}><Play size={16} fill="currentColor" /> Start adaptive quiz</button></section>
    <section className="stats-grid">
      <StatCard icon={Target} label="Overall accuracy" value={(overview.accuracy || 0) + '%'} note="Across completed answers" tone="violet" />
      <StatCard icon={BookOpen} label="Quizzes completed" value={overview.totalAttempts || 0} note="Your learning history" tone="blue" />
      <StatCard icon={CheckCircle2} label="Correct answers" value={overview.totalCorrect || 0} note={'Out of ' + (overview.totalAnswered || 0) + ' answered'} tone="green" />
      <StatCard icon={Flame} label="Topics explored" value={topics.length} note="Keep building your range" tone="orange" />
    </section>
    <section className="content-grid">
      <div className="panel topic-panel">
        <div className="panel-heading"><div><span className="eyebrow">KNOWLEDGE MAP</span><h2>Topic performance</h2></div><button className="icon-button" onClick={onRefresh} title="Refresh progress"><RefreshCw size={16} className={loading ? 'spin' : ''} /></button></div>
        {topics.length === 0 ? <EmptyState onStart={onStart} /> : <div className="topic-list">{topics.map((topic) => <div className="topic-row" key={topic.topic}>
          <div className="topic-topline"><div><strong>{topic.topic}</strong><span className={'status-pill ' + (topic.status === 'Strong' ? 'good' : topic.status === 'Developing' ? 'mid' : topic.status === 'Building baseline' ? 'baseline' : 'needs')}>{topic.status}</span></div><strong className="topic-percent">{topic.accuracy}%</strong></div>
          <div className="progress-track"><div className="progress-fill" style={{ width: topic.accuracy + '%' }} /></div><div className="topic-foot">{topic.correct} correct of {topic.attempted} attempted</div>
        </div>)}</div>}
      </div>
      <div className="panel recommendation-panel">
        <div className="panel-heading"><div><span className="eyebrow">YOUR NEXT STEP</span><h2>Learning suggestions</h2></div><div className="heading-icon"><Sparkles size={17} /></div></div>
        {suggestions.length === 0 ? <div className="recommendation-empty"><div className="soft-orb"><Sparkles size={25} /></div><h3>Personalized guidance is on its way</h3><p>After your first quiz, we will identify the topics that need attention and suggest what to practise next.</p></div> : suggestions.map((item) => <div className="recommendation-item" key={item.topic}><div className="recommendation-dot"><Target size={15} /></div><div><strong>{item.topic} <span>{item.accuracy}%</span></strong><p>{item.message}</p></div></div>)}
      </div>
    </section>
    <section className="panel history-panel"><div className="panel-heading"><div><span className="eyebrow">KEEP YOUR MOMENTUM</span><h2>Recent activity</h2></div><span className="subtle-label">Latest 5 attempts</span></div>
      {attempts.length === 0 ? <div className="history-empty"><Clock3 size={18} /><span>No quiz attempts yet. Your completed quizzes will appear here.</span></div> : attempts.map((item, index) => <div className="history-row" key={item.id || index}><div className="history-symbol"><GraduationCap size={17} /></div><div className="history-name"><strong>Adaptive programming quiz</strong><span>{dateLabel(item.completedAt)}</span></div><div className="history-score"><strong>{item.score}/{item.totalQuestions}</strong><span>Score</span></div><div className="history-accuracy"><strong>{item.accuracy}%</strong><span>Accuracy</span></div></div>)}
    </section>
  </div>;
}

function QuizView({ question, selected, setSelected, feedback, onSubmit, onContinue, onExit, submitting, error }) {
  if (!question) return null;
  return <div className="quiz-shell">
    <div className="quiz-topbar"><button className="back-button" onClick={onExit}><ArrowLeft size={16} /> Exit quiz</button><div className="quiz-progress-copy">QUESTION <strong>{question.questionNumber}</strong> OF {question.totalQuestions}</div></div>
    <div className="quiz-progress-track"><div style={{ width: ((question.questionNumber - 1) / question.totalQuestions) * 100 + '%' }} /></div>
    <div className="quiz-card">
      <div className="quiz-meta"><span className="topic-chip">{question.topic}</span><span className={'difficulty-chip ' + question.difficulty.toLowerCase()}><span />{question.difficulty}</span></div>
      <div className="question-kicker">TAKE YOUR TIME · THINK IT THROUGH</div><h1>{question.questionText}</h1>
      <div className="options-list">{question.options.map((option, index) => {
        const chosen = selected === index;
        const right = feedback && feedback.correctOptionIndex === index;
        const wrongChosen = feedback && chosen && !feedback.isCorrect;
        return <button type="button" className={'option-button ' + (chosen ? 'selected' : '') + (right ? ' is-right' : '') + (wrongChosen ? ' is-wrong' : '')} key={option} onClick={() => !feedback && setSelected(index)} disabled={Boolean(feedback)}>
          <span className="option-letter">{String.fromCharCode(65 + index)}</span><span>{option}</span>{right && <CheckCircle2 size={18} className="option-result" />}{wrongChosen && <XCircle size={18} className="option-result" />}
        </button>;
      })}</div>
      {error && <div className="inline-error">{error}</div>}
      {feedback && <div className={'feedback-box ' + (feedback.isCorrect ? 'correct' : 'incorrect')}><div className="feedback-title">{feedback.isCorrect ? <CheckCircle2 size={18} /> : <CircleHelp size={18} />}{feedback.isCorrect ? 'Nice work — that is correct!' : 'Not quite — let us learn from it.'}</div><p>{feedback.explanation}</p></div>}
      <div className="quiz-actions"><span className="selection-hint">{feedback ? 'Answer saved to your learning history' : selected === null ? 'Choose one answer to continue' : 'Answer selected'}</span>
        {!feedback ? <button className="primary-button" disabled={selected === null || submitting} onClick={onSubmit}>{submitting && <LoaderCircle className="spin" size={17} />} Submit answer <ArrowRight size={16} /></button> : <button className="primary-button" onClick={onContinue}>{feedback.completed ? 'View results' : 'Next question'} <ArrowRight size={16} /></button>}
      </div>
    </div>
    <div className="adaptive-note"><Brain size={17} /><span><strong>Adaptive learning is active.</strong> Your next question's difficulty responds to your recent answers.</span></div>
  </div>;
}

function ResultsView({ result, onDashboard, onRetry }) {
  if (!result) return null;
  const accuracy = result.accuracy || 0;
  return <div className="results-wrap"><div className="results-card">
    <div className="result-trophy"><Trophy size={30} /></div><div className="eyebrow">QUIZ COMPLETED</div>
    <h1>{accuracy >= 80 ? 'Brilliant progress!' : accuracy >= 50 ? 'You are moving forward!' : 'Every attempt is progress.'}</h1>
    <p className="result-description">Your answers have been saved. Review what went well and keep learning.</p>
    <div className="result-score"><strong>{result.score}<span>/{result.totalQuestions}</span></strong><label>Correct answers</label></div>
    <div className="result-meter"><div style={{ width: accuracy + '%' }} /></div><div className="result-accuracy">{accuracy}% <span>overall accuracy</span></div>
    <div className="result-review"><div className="review-heading">Answer review</div>{(result.responses || []).map((response, index) => <div className="review-row" key={index}><div className={response.isCorrect ? 'review-check good' : 'review-check bad'}>{response.isCorrect ? <Check size={14} /> : <XCircle size={14} />}</div><div className="review-copy"><strong>{response.topic} · {response.questionText}</strong><span>Your answer: {response.selectedAnswer || 'Recorded'} · Correct answer: {response.correctAnswer || 'See explanation'}</span><p>{response.explanation}</p></div></div>)}</div>
    <div className="result-actions"><button className="secondary-button" onClick={onDashboard}>Back to dashboard</button><button className="primary-button" onClick={onRetry}><RefreshCw size={16} /> Try another quiz</button></div>
  </div></div>;
}

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [progress, setProgress] = useState(null);
  const [health, setHealth] = useState('checking');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(null);
  const [question, setQuestion] = useState(null);
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  const refreshProgress = useCallback(async () => {
    setLoading(true);
    try {
      setProgress(await getProgress(STUDENT_ID));
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getHealth().then((data) => setHealth(data.database === 'connected' ? 'connected' : 'disconnected')).catch(() => setHealth('disconnected'));
    refreshProgress();
  }, [refreshProgress]);

  async function beginQuiz() {
    setError('');
    setResult(null);
    setFeedback(null);
    setSelected(null);
    try {
      const data = await startQuiz(STUDENT_ID);
      setAttempt(data.attemptId);
      setQuestion(data.question);
      setActiveTab('quiz');
    } catch (err) {
      setError(err.message);
      setActiveTab('overview');
    }
  }

  async function handleSubmit() {
    if (selected === null || !attempt || !question) return;
    setSubmitting(true);
    setError('');
    try {
      const data = await submitAnswer(attempt, question.id, selected);
      setFeedback({ ...data.feedback, completed: data.completed, nextQuestion: data.nextQuestion, result: data.result });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleContinue() {
    if (!feedback) return;
    if (feedback.completed) {
      setResult(feedback.result);
      setQuestion(null);
      setFeedback(null);
      await refreshProgress();
      setActiveTab('results');
      return;
    }
    setQuestion(feedback.nextQuestion);
    setSelected(null);
    setFeedback(null);
  }

  function exitQuiz() {
    setAttempt(null);
    setQuestion(null);
    setFeedback(null);
    setSelected(null);
    setActiveTab('overview');
  }

  const history = progress?.attemptHistory || progress?.recentAttempts || [];

  return <div className="app-frame">
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark"><Brain size={21} /></div><div><strong>mindstep</strong><span>ADAPTIVE LEARNING</span></div></div>
      <div className="sidebar-section-label">WORKSPACE</div>
      <nav className="side-nav">
        <button className={activeTab === 'overview' ? 'active' : ''} onClick={() => setActiveTab('overview')}><LayoutDashboard size={18} /> Overview</button>
        <button className={activeTab === 'history' ? 'active' : ''} onClick={() => setActiveTab('history')}><TrendingUp size={18} /> Learning history</button>
      </nav>
      <div className="sidebar-bottom"><div className="sidebar-tip"><div className="tip-icon"><Sparkles size={16} /></div><strong>Keep showing up.</strong><p>Consistency turns practice into progress.</p></div><div className="profile-row"><div className="avatar">L</div><div><strong>Learner</strong><span>Student workspace</span></div><LogOut size={16} className="profile-more" /></div></div>
    </aside>
    <main className="main-area">
      <header className="topbar"><div className="breadcrumb">Workspace <ChevronRight size={14} /> <strong>{activeTab === 'quiz' ? 'Adaptive quiz' : activeTab === 'results' ? 'Quiz results' : activeTab === 'history' ? 'Learning history' : 'Overview'}</strong></div><div className="topbar-right"><span className={'connection-status ' + health}><i />{health === 'connected' ? 'Database connected' : health === 'checking' ? 'Checking database' : 'Database unavailable'}</span><div className="topbar-avatar">L</div></div></header>
      {error && activeTab !== 'quiz' && <div className="global-error">{error}<button onClick={() => setError('')}>Dismiss</button></div>}
      {activeTab === 'overview' && <Dashboard progress={progress} onStart={beginQuiz} onRefresh={refreshProgress} loading={loading} />}
      {activeTab === 'quiz' && <QuizView question={question} selected={selected} setSelected={setSelected} feedback={feedback} onSubmit={handleSubmit} onContinue={handleContinue} onExit={exitQuiz} submitting={submitting} error={error} />}
      {activeTab === 'results' && <ResultsView result={result} onDashboard={() => setActiveTab('overview')} onRetry={beginQuiz} />}
      {activeTab === 'history' && <div className="page-content"><section className="welcome-row"><div><div className="eyebrow">YOUR JOURNEY</div><h1>Learning history</h1><p>Every completed quiz is a step forward.</p></div><button className="secondary-button" onClick={refreshProgress}><RefreshCw size={15} /> Refresh</button></section><div className="panel history-panel full-history"><div className="panel-heading"><div><span className="eyebrow">ALL COMPLETED ATTEMPTS</span><h2>Learning history</h2></div><span className="subtle-label">{history.length} stored records</span></div>{history.length === 0 ? <EmptyState onStart={beginQuiz} /> : history.map((item, index) => <div className="history-row" key={item.id || index}><div className="history-symbol"><GraduationCap size={17} /></div><div className="history-name"><strong>Adaptive programming quiz</strong><span>{dateLabel(item.completedAt)}</span></div><div className="history-score"><strong>{item.score}/{item.totalQuestions}</strong><span>Score</span></div><div className="history-accuracy"><strong>{item.accuracy}%</strong><span>Accuracy</span></div></div>)}</div></div>}
    </main>
  </div>;
}
