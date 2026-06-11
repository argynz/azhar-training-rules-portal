import { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  FormControl,
  InputAdornment,
  InputLabel,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  Stack,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  Bell,
  BookOpen,
  Bot,
  CheckCircle2,
  Download,
  History,
  Printer,
  Search,
  ShieldCheck,
  Users,
} from 'lucide-react';
import {
  assistantQuestions,
  changeLog,
  documentMeta,
  employees,
  faqAnswers,
  notifications,
  roles,
  sections,
} from './data.js';

const allItems = sections.flatMap((section) =>
  section.items.map((item) => ({ ...item, sectionId: section.id, sectionTitle: section.title })),
);

const navItems = [
  { id: 'overview', label: 'Обзор', icon: BookOpen },
  { id: 'rules', label: 'Правила', icon: Search },
  { id: 'changes', label: 'История', icon: History },
  { id: 'assistant', label: 'Помощник', icon: Bot },
  { id: 'reports', label: 'Отчеты', icon: Users },
];

function getAcknowledgement() {
  const stored = localStorage.getItem('training-rules-acknowledgement');
  return stored ? JSON.parse(stored) : null;
}

function findAnswer(question) {
  const normalized = question.trim().toLowerCase();

  if (!normalized) {
    return null;
  }

  // Check FAQ answers first
  const faqMatch = faqAnswers.find(({ keywords, question: q }) => {
    if (q.toLowerCase() === normalized) return true;
    return keywords.some((kw) => normalized.includes(kw));
  });
  if (faqMatch) {
    const item = allItems.find((i) => i.number === faqMatch.itemNumber);
    if (item) return item;
  }

  return allItems.find((item) =>
    `${item.number} ${item.title} ${item.text} ${item.sectionTitle}`.toLowerCase().includes(normalized),
  );
}

function Stat({ label, value, tone = 'default' }) {
  return (
    <Paper className={`stat stat-${tone}`} variant="outlined">
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="h2">{value}</Typography>
    </Paper>
  );
}

function App() {
  const [activeView, setActiveView] = useState('overview');
  const [role, setRole] = useState('employee');
  const [query, setQuery] = useState('');
  const [sectionFilter, setSectionFilter] = useState('all');
  const [question, setQuestion] = useState('');
  const [assistantItem, setAssistantItem] = useState(null);
  const [acknowledgement, setAcknowledgement] = useState(getAcknowledgement);

  const filteredItems = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return allItems.filter((item) => {
      const matchesSection = sectionFilter === 'all' || item.sectionId === sectionFilter;
      const source = `${item.number} ${item.title} ${item.text} ${item.sectionTitle}`.toLowerCase();
      const matchesQuery = !normalized || source.includes(normalized);
      return matchesSection && matchesQuery;
    });
  }, [query, sectionFilter]);

  const acknowledgedCount = employees.filter((employee) => employee.acknowledged).length;
  const acknowledgedPercent = Math.round((acknowledgedCount / employees.length) * 100);

  function acknowledgeRules() {
    const payload = {
      name: 'Текущий работник',
      personnelNumber: 'ME-0001',
      version: documentMeta.version,
      date: new Date().toLocaleString('ru-RU'),
    };
    localStorage.setItem('training-rules-acknowledgement', JSON.stringify(payload));
    setAcknowledgement(payload);
  }

  function downloadRules() {
    const content = sections
      .map(
        (section) =>
          `${section.title}\n\n${section.items
            .map((item) => `${item.number}. ${item.title}\n${item.text}`)
            .join('\n\n')}`,
      )
      .join('\n\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'training-rules.txt';
    link.click();
    URL.revokeObjectURL(url);
  }

  function askAssistant(nextQuestion = question) {
    setQuestion(nextQuestion);
    setAssistantItem(findAnswer(nextQuestion));
  }

  return (
    <Box className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <ShieldCheck size={28} />
          <div>
            <Typography variant="h3">HR Rules</Typography>
            <Typography variant="caption">Обучение и развитие</Typography>
          </div>
        </div>

        <Tabs
          orientation="vertical"
          value={activeView}
          onChange={(_, value) => setActiveView(value)}
          className="nav-tabs"
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Tab
                key={item.id}
                value={item.id}
                label={item.label}
                icon={<Icon size={18} />}
                iconPosition="start"
              />
            );
          })}
        </Tabs>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <Typography variant="h1">{documentMeta.title}</Typography>
            <Typography color="text.secondary">{documentMeta.description}</Typography>
          </div>
          <FormControl size="small" className="role-select">
            <InputLabel>Роль</InputLabel>
            <Select value={role} label="Роль" onChange={(event) => setRole(event.target.value)}>
              {roles.map((roleItem) => (
                <MenuItem key={roleItem.id} value={roleItem.id}>
                  {roleItem.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </header>

        {activeView === 'overview' && (
          <Stack spacing={3}>
            <section className="overview-band">
              <div>
                <Typography variant="overline">Актуальная редакция</Typography>
                <Typography variant="h2">Версия {documentMeta.version}</Typography>
                <Typography color="text.secondary">Последнее обновление: {documentMeta.updatedAt}</Typography>
              </div>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Chip icon={<Bell size={16} />} label={`${documentMeta.newChanges} новых изменения`} />
                <Chip color={acknowledgement ? 'success' : 'warning'} label={acknowledgement ? 'Ознакомлен' : 'Требуется ознакомление'} />
              </Stack>
            </section>

            <div className="stats-grid">
              <Stat label="Пользователей" value={employees.length} />
              <Stat label="Ознакомились" value={`${acknowledgedPercent}%`} tone="green" />
              <Stat label="Вопросов помощнику" value="128" tone="brown" />
              <Stat label="Просмотров разделов" value="742" />
            </div>

            <section className="content-section">
              <div className="section-heading">
                <Typography variant="h2">Последние изменения</Typography>
                <Button variant="contained" onClick={() => setActiveView('rules')}>
                  Перейти к правилам
                </Button>
              </div>
              <div className="change-list">
                {changeLog[0].items.map((itemNumber) => {
                  const item = allItems.find((ruleItem) => ruleItem.number === itemNumber);
                  return (
                    <Paper key={itemNumber} variant="outlined" className="list-row">
                      <Typography variant="h3">
                        {item.number} {item.title}
                      </Typography>
                      <Typography color="text.secondary">{item.text}</Typography>
                    </Paper>
                  );
                })}
              </div>
            </section>
          </Stack>
        )}

        {activeView === 'rules' && (
          <Stack spacing={3}>
            <section className="toolbar">
              <TextField
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Поиск: обучение, командировка, оплата"
                size="small"
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search size={18} />
                    </InputAdornment>
                  ),
                }}
              />
              <FormControl size="small" className="filter-select">
                <InputLabel>Раздел</InputLabel>
                <Select value={sectionFilter} label="Раздел" onChange={(event) => setSectionFilter(event.target.value)}>
                  <MenuItem value="all">Все разделы</MenuItem>
                  {sections.map((section) => (
                    <MenuItem key={section.id} value={section.id}>
                      {section.title}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Tooltip title="Печать документа">
                <Button variant="outlined" aria-label="Печать" onClick={() => window.print()}>
                  <Printer size={18} />
                </Button>
              </Tooltip>
              <Tooltip title="Скачать текстовую версию">
                <Button variant="outlined" aria-label="Скачать" onClick={downloadRules}>
                  <Download size={18} />
                </Button>
              </Tooltip>
            </section>

            <section className="content-section">
              <div className="section-heading">
                <Typography variant="h2">Найдено пунктов: {filteredItems.length}</Typography>
                <Button color="success" variant="contained" onClick={acknowledgeRules} startIcon={<CheckCircle2 size={18} />}>
                  Ознакомлен
                </Button>
              </div>

              {acknowledgement && (
                <Alert severity="success">
                  Ознакомление с версией {acknowledgement.version} подтверждено: {acknowledgement.date}
                </Alert>
              )}

              <div className="rules-list">
                {filteredItems.map((item) => (
                  <Paper key={item.number} variant="outlined" className="rule-item">
                    <div className="rule-meta">
                      <Chip size="small" label={`Пункт ${item.number}`} />
                      <Chip size="small" variant="outlined" label={`Версия ${item.version}`} />
                      <Typography variant="caption">Изменен: {item.changedAt}</Typography>
                    </div>
                    <Typography variant="h3">{item.title}</Typography>
                    <Typography>{item.text}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {item.sectionTitle}
                    </Typography>
                  </Paper>
                ))}
              </div>
            </section>
          </Stack>
        )}

        {activeView === 'changes' && (
          <section className="content-section">
            <Typography variant="h2">История изменений</Typography>
            <div className="timeline">
              {changeLog.map((change) => (
                <Paper key={change.version} variant="outlined" className="timeline-row">
                  <div>
                    <Typography variant="h3">Версия {change.version}</Typography>
                    <Typography color="text.secondary">
                      {change.date} · {change.author}
                    </Typography>
                  </div>
                  <Divider flexItem orientation="vertical" />
                  <div>
                    <Typography>{change.description}</Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" mt={1}>
                      {change.items.map((item) => (
                        <Chip key={item} size="small" label={item} />
                      ))}
                    </Stack>
                  </div>
                </Paper>
              ))}
            </div>
          </section>
        )}

        {activeView === 'assistant' && (
          <Stack spacing={3}>
            <section className="content-section">
              <Typography variant="h2">Интеллектуальный помощник по Правилам</Typography>
              <div className="assistant-box">
                <TextField
                  value={question}
                  onChange={(event) => setQuestion(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      askAssistant();
                    }
                  }}
                  placeholder="Например: кто оплачивает обучение?"
                  fullWidth
                />
                <Button variant="contained" onClick={() => askAssistant()} startIcon={<Bot size={18} />}>
                  Спросить
                </Button>
              </div>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {assistantQuestions.map((sample) => (
                  <Chip key={sample} label={sample} onClick={() => askAssistant(sample)} />
                ))}
              </Stack>
            </section>

            {assistantItem && (
              <Paper variant="outlined" className="answer-panel">
                <Typography variant="overline">Ответ сформирован на основании действующей редакции</Typography>
                <Typography variant="h3">
                  Пункт {assistantItem.number}. {assistantItem.title}
                </Typography>
                <Typography>{assistantItem.text}</Typography>
                <Button variant="text" onClick={() => setActiveView('rules')}>
                  Открыть раздел Правил
                </Button>
              </Paper>
            )}

            {question && !assistantItem && (
              <Alert severity="info">
                Помощник не нашел точного пункта. Попробуйте уточнить запрос словами из Правил.
              </Alert>
            )}
          </Stack>
        )}

        {activeView === 'reports' && (
          <Stack spacing={3}>
            <section className="content-section">
              <div className="section-heading">
                <Typography variant="h2">Контроль ознакомления</Typography>
                <Chip label={role === 'employee' ? 'Доступ работника' : 'Расширенный доступ'} />
              </div>
              <LinearProgress variant="determinate" value={acknowledgedPercent} className="progress" />
              <Typography color="text.secondary">{acknowledgedCount} из {employees.length} сотрудников ознакомились</Typography>

              <div className="employee-table">
                {employees.map((employee) => (
                  <Paper key={employee.id} variant="outlined" className="employee-row">
                    <div>
                      <Typography variant="h3">{employee.name}</Typography>
                      <Typography color="text.secondary">Табельный номер: {employee.personnelNumber}</Typography>
                    </div>
                    <Chip
                      color={employee.acknowledged ? 'success' : 'warning'}
                      label={employee.acknowledged ? 'Да' : 'Нет'}
                    />
                  </Paper>
                ))}
              </div>
            </section>

            <section className="content-section">
              <Typography variant="h2">Уведомления</Typography>
              <div className="notification-list">
                {notifications.map((notification) => (
                  <Paper key={notification.id} variant="outlined" className="list-row">
                    <div className="row-title">
                      <Chip size="small" label={notification.channel} />
                      <Typography variant="h3">{notification.title}</Typography>
                    </div>
                    <Typography color="text.secondary">{notification.text}</Typography>
                    <Typography variant="caption">{notification.status}</Typography>
                  </Paper>
                ))}
              </div>
            </section>
          </Stack>
        )}
      </main>
    </Box>
  );
}

export default App;
