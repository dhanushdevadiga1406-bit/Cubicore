/**
 * CUBICORE — Dynamic Multi-Agentic Factory Frontend Application
 * Architecture: Decrease-and-Conquer Multi-Agent State Machine & Simulation
 */

// ============================================================================
// GLOBAL STATE & DATA STORES
// ============================================================================
const state = {
  currentStage: 'no_plan', // 'no_plan' | 'after_plan' | 'run_in_flight' | 'after_run' | 'issues_found' | 'everything_passes'
  cycleCount: 1,
  cycleMax: 3,
  activeScenario: 'demo', // 'demo' | 'full' | 'team-demo' | 'team-full'
  soundEnabled: false,
  audioCtx: null,
  activeWorktrees: 0,
  tokenReads: '0M',
  associates: [],
  logs: [],
  currentArtifact: 'plan_md',
  activePreview: 'todo', // 'todo' | 'finance'
  userTodos: [
    { id: 1, text: 'Define contract write scopes', done: true },
    { id: 2, text: 'Spawn associate git worktrees', done: true },
    { id: 3, text: 'Run mechanical check matrix', done: false }
  ],
  userExpenses: [
    { id: 1, desc: 'Cloud Server Worktree Cluster', cat: 'Infrastructure', amount: 145.00, date: '2026-11-05' },
    { id: 2, desc: 'Domain & SSL Registration', cat: 'Marketing', amount: 35.00, date: '2026-11-06' },
    { id: 3, desc: 'Model Context Cache Allocation', cat: 'AI Compute', amount: 210.50, date: '2026-11-07' }
  ]
};

// Scenario presets
const SCENARIO_PRESETS = {
  demo: {
    title: 'Solo — Demo (/cubicore:plan-demo)',
    prompt: 'Make me a simple todo app that works in the browser.',
    summary: 'Scope: Simple Browser Todo App • 3 Sub-Agents • Disjoint: UI, Storage, Validation • Failing checks prepared',
    contracts: [
      {
        id: 'assoc-01',
        name: 'Associate Alpha',
        role: 'Frontend UI & DOM',
        scope: 'src/index.html',
        worktree: '.git/worktrees/wt-assoc-01',
        checks: [
          { name: 'Initial DOM render check', passed: false },
          { name: 'Interactive event listener check', passed: false }
        ]
      },
      {
        id: 'assoc-02',
        name: 'Associate Beta',
        role: 'State & LocalStorage Engine',
        scope: 'src/store.js',
        worktree: '.git/worktrees/wt-assoc-02',
        checks: [
          { name: 'Storage serialization test', passed: false },
          { name: 'State mutation idempotency', passed: false }
        ]
      },
      {
        id: 'assoc-03',
        name: 'Associate Gamma',
        role: 'Mechanical Validation & Styles',
        scope: 'src/styles.css',
        worktree: '.git/worktrees/wt-assoc-03',
        checks: [
          { name: 'CSS flexbox/grid layout check', passed: false },
          { name: 'No loose code / zero syntax errors', passed: false }
        ]
      }
    ]
  },
  full: {
    title: 'Solo — Full (/cubicore:plan-full)',
    prompt: 'Build me a personal finance tracker with categories, monthly summaries, and CSV export.',
    summary: 'Scope: Personal Finance Tracker • 6 Sub-Agents • 6-12 Disjoint Contracts • CSV Exporter & Matrix Checks',
    contracts: [
      {
        id: 'assoc-01',
        name: 'Associate Alpha',
        role: 'Dashboard UI & Metrics',
        scope: 'src/components/Dashboard.js',
        worktree: '.git/worktrees/wt-assoc-01',
        checks: [{ name: 'KPI Card calculations', passed: false }, { name: 'Responsive grid check', passed: false }]
      },
      {
        id: 'assoc-02',
        name: 'Associate Beta',
        role: 'Transaction Store & Math',
        scope: 'src/data/transactions.js',
        worktree: '.git/worktrees/wt-assoc-02',
        checks: [{ name: 'Balance aggregation invariant', passed: false }, { name: 'Category filtering check', passed: false }]
      },
      {
        id: 'assoc-03',
        name: 'Associate Gamma',
        role: 'CSV Generator & Export Pipeline',
        scope: 'src/exporters/csv.js',
        worktree: '.git/worktrees/wt-assoc-03',
        checks: [{ name: 'RFC 4180 CSV compliance', passed: false }, { name: 'MIME blob creation', passed: false }]
      },
      {
        id: 'assoc-04',
        name: 'Associate Delta',
        role: 'Category Visualizer Component',
        scope: 'src/components/CategoryChart.js',
        worktree: '.git/worktrees/wt-assoc-04',
        checks: [{ name: 'Bar representation math', passed: false }]
      },
      {
        id: 'assoc-05',
        name: 'Associate Epsilon',
        role: 'Local Persistence Layer',
        scope: 'src/storage/db.js',
        worktree: '.git/worktrees/wt-assoc-05',
        checks: [{ name: 'Schema migration check', passed: false }]
      },
      {
        id: 'assoc-06',
        name: 'Associate Zeta',
        role: 'Mechanical Verification Harness',
        scope: 'tests/finance.matrix.js',
        worktree: '.git/worktrees/wt-assoc-06',
        checks: [{ name: 'End-to-end integration pass', passed: false }]
      }
    ]
  },
  'team-demo': {
    title: 'Team of 3 — Demo (/cubicore:plan-demo then split)',
    prompt: 'Make a hackathon project board where our team can drop ideas and vote on them.',
    summary: 'Scope: Hackathon Board • Plan split across 3 team members • Disjoint write scopes in parallel worktrees',
    contracts: [
      {
        id: 'assoc-01',
        name: 'Member A (Plan 1)',
        role: 'Frontend Board UI',
        scope: 'src/board/ui.js',
        worktree: '.git/worktrees/wt-member-a',
        checks: [{ name: 'Idea card drag & drop', passed: false }]
      },
      {
        id: 'assoc-02',
        name: 'Member B (Plan 2)',
        role: 'Voting Logic & Score API',
        scope: 'src/voting/engine.js',
        worktree: '.git/worktrees/wt-member-b',
        checks: [{ name: 'Vote tally concurrency gate', passed: false }]
      },
      {
        id: 'assoc-03',
        name: 'Member C (Plan 3)',
        role: 'Idea Storage & Export',
        scope: 'src/storage/ideas.js',
        worktree: '.git/worktrees/wt-member-c',
        checks: [{ name: 'JSON file persistence', passed: false }]
      }
    ]
  },
  'team-full': {
    title: 'Team of 3 — Full (/cubicore:plan-full then split)',
    prompt: 'Build a client portal for our small design agency: client login, project uploads, invoice PDFs, and a dashboard.',
    summary: 'Scope: Agency Client Portal • Split into 3 independent worktrees • Auth, Uploads/Invoicing, Dashboard',
    contracts: [
      {
        id: 'assoc-01',
        name: 'Member A (Plan 1)',
        role: 'Auth & Client Portal UI',
        scope: 'src/auth/portal.js',
        worktree: '.git/worktrees/wt-member-a',
        checks: [{ name: 'Session token validation', passed: false }]
      },
      {
        id: 'assoc-02',
        name: 'Member B (Plan 2)',
        role: 'Uploads & Invoice Generation',
        scope: 'src/billing/invoices.js',
        worktree: '.git/worktrees/wt-member-b',
        checks: [{ name: 'PDF generator check', passed: false }]
      },
      {
        id: 'assoc-03',
        name: 'Member C (Plan 3)',
        role: 'Dashboard & Reporting',
        scope: 'src/reporting/dashboard.js',
        worktree: '.git/worktrees/wt-member-c',
        checks: [{ name: 'Deliverables summary status', passed: false }]
      }
    ]
  }
};

// Guided flow state table
const GUIDED_FLOW_MAP = {
  no_plan: {
    stateLabel: 'no plan',
    mainCmd: '/cubicore:plan-demo',
    alts: ['/cubicore:plan-full', '/cubicore:estimate'],
    description: 'Prepare repository, research tree, and write plan without dispatching.'
  },
  after_plan: {
    stateLabel: 'plan ready',
    mainCmd: '/cubicore:execute',
    alts: ['/cubicore:estimate', '/cubicore:refine'],
    description: 'Dispatch the plan! Parallel associates will be summoned into isolated worktrees.'
  },
  run_in_flight: {
    stateLabel: 'run in flight',
    mainCmd: '/cubicore:status',
    alts: ['/cubicore:status'],
    description: 'Associates are actively writing and executing check matrices in worktrees.'
  },
  after_run: {
    stateLabel: 'after the run',
    mainCmd: '/cubicore:preview',
    alts: ['/cubicore:debug', '/cubicore:refine', '/cubicore:undo', '/cubicore:continue'],
    description: 'Inspect the running application on localhost or run mechanical debug.'
  },
  issues_found: {
    stateLabel: 'issues found',
    mainCmd: '/cubicore:debug',
    alts: ['/cubicore:refine', '/cubicore:undo', '/cubicore:continue'],
    description: 'Mechanical matrix catches errors. Cubicore attempts narrowly-scoped fixes.'
  },
  everything_passes: {
    stateLabel: 'everything passes',
    mainCmd: '/cubicore:deploy',
    alts: ['/cubicore:preview', '/cubicore:refine', '/cubicore:undo'],
    description: 'All mechanical checks passed! Generate deployment plan and stack configs.'
  }
};

// Artifact file contents
const ARTIFACT_FILES = {
  plan_md: `# CUBICORE_PLAN.md
> **Summary**: A high-efficiency browser-based application built using the Decrease-and-Conquer technique with disjoint contract write scopes.

## 1. Architectural Topology
- **Model**: OpenCode v1.18.x with bounded 120-step associates
- **Isolation**: Per-associate Git worktrees
- **Budget**: Graph budget allocated (120 steps / 3 cycles max)

## 2. Contracts Matrix
| Contract ID | Associate | Disjoint Scope | Failing Verification Check | Status |
|---|---|---|---|---|
| CT-01 | Assoc Alpha | \`src/index.html\` | \`test_dom_elements_present()\` | READY |
| CT-02 | Assoc Beta  | \`src/store.js\`   | \`test_storage_serialization()\` | READY |
| CT-03 | Assoc Gamma | \`src/styles.css\` | \`test_flex_grid_conformance()\` | READY |

## 3. Scope Gate Boundary
- Collision check: PASSED (Over-approximation confirmed 0 overlapping directories)
- Copy-back policy: Gated strictly on mechanical check matrix completion.`,

  plan_json: `{
  "$schema": "https://cubicore.dev/schemas/v1/plan.json",
  "project": "Cubicore Factory Demo",
  "version": "1.0.0",
  "cycle_limit": 3,
  "runtime": {
    "host": "opencode",
    "version": "1.18.x",
    "max_steps_per_associate": 120
  },
  "contracts": [
    {
      "id": "CT-01",
      "associate": "Alpha",
      "write_scope": ["src/index.html"],
      "worktree": ".git/worktrees/wt-assoc-01",
      "check_command": "node tests/dom.test.js"
    },
    {
      "id": "CT-02",
      "associate": "Beta",
      "write_scope": ["src/store.js"],
      "worktree": ".git/worktrees/wt-assoc-02",
      "check_command": "node tests/store.test.js"
    },
    {
      "id": "CT-03",
      "associate": "Gamma",
      "write_scope": ["src/styles.css"],
      "worktree": ".git/worktrees/wt-assoc-03",
      "check_command": "npx stylelint src/styles.css"
    }
  ]
}`,

  context_md: `# CUBICORE_CONTEXT.md
*Written for founders presenting in person. Never parsed by Execute or Dispatch.*

### Problem
Splitting work without coordination is not free parallelism. Twelve uncoordinated workers cost 10.9× tokens and are 2.6× slower due to context bloat and git collisions.

### Users & Use Cases
- **Founders & Solo Devs**: Ship multi-component software from home using autonomous fleets without merge conflicts.
- **Teams**: Split hackathons or sprints across independent worktrees with validated disjoint scopes.

### Benefits & Value
- **3.5× Cheaper Tokens**: Workers only load the context needed for their contract (25.0M tokens vs 96.0M cache reads).
- **Airtight Filesystem Boundary**: Worktrees keep associates physically apart.
- **Mechanical Certainty**: "Done" means checks passed, not that an LLM said so.

### Market Opportunity & The Ask
Empower individual engineers to command a fleet of 10+ sub-agents with industrial reliability.`,

  debug_md: `# CUBICORE_DEBUG.md
*Mechanical Verification Matrix & Scope Gate Report*

## Matrix Results
| File | Declared Scope | Actual Changed | Mechanical Status | Advisory Note |
|---|---|---|---|---|
| \`src/index.html\` | \`src/index.html\` | MATCH | ✅ PASS (DOM clean) | Production ready |
| \`src/store.js\` | \`src/store.js\` | MATCH | ✅ PASS (State serialized) | Low latency |
| \`src/styles.css\` | \`src/styles.css\` | MATCH | ✅ PASS (No loose code) | Responsive |

## Findings & Automated Fixes
- **Finding 01**: Detected missing closing \`</div>\` in template fragment.
  - *Fix Applied*: Narrowly-scoped AST tag balance patch applied.
- **Finding 02**: Advisory: Unused CSS selector \`.old-banner\`.
  - *Status*: Advisory only. Judgement checks never block the founder.`
};

// ============================================================================
// AUDIO SYNTHESIZER (Optional Sci-Fi UI Feedback)
// ============================================================================
function playBeep(freq = 600, type = 'sine', duration = 0.08) {
  if (!state.soundEnabled) return;
  try {
    if (!state.audioCtx) {
      state.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    const osc = state.audioCtx.createOscillator();
    const gain = state.audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, state.audioCtx.currentTime);
    gain.gain.setValueAtTime(0.04, state.audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, state.audioCtx.currentTime + duration);
    osc.connect(gain);
    gain.connect(state.audioCtx.destination);
    osc.start();
    osc.stop(state.audioCtx.currentTime + duration);
  } catch (e) {
    // Audio context may require user gesture
  }
}

// ============================================================================
// UI INITIALIZATION & EVENT LISTENERS
// ============================================================================
document.addEventListener('DOMContentLoaded', () => {
  initNavTabs();
  initPresetSelectors();
  initSimulationControls();
  initTerminal();
  initPreviewApps();
  initArtifactViewer();
  initCollisionTester();
  initSetupModal();
  initSoundToggle();

  // Load default demo preset
  loadScenario('demo');
  updateGuidedFlow('no_plan');
});

// Sound Toggle
function initSoundToggle() {
  const btn = document.getElementById('soundToggleBtn');
  if (!btn) return;
  btn.addEventListener('click', () => {
    state.soundEnabled = !state.soundEnabled;
    btn.innerHTML = state.soundEnabled ? '<span class="icon">🔊</span> Audio: ON' : '<span class="icon">🔇</span> Audio';
    btn.classList.toggle('btn-primary', state.soundEnabled);
    if (state.soundEnabled) playBeep(880, 'triangle', 0.1);
    showToast(state.soundEnabled ? 'UI Audio enabled' : 'UI Audio muted', 'info');
  });
}

// Module Navigation Tabs
function initNavTabs() {
  const tabBtns = document.querySelectorAll('.nav-tab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      switchModuleSection(targetId, btn);
    });
  });
}

function switchModuleSection(sectionId, clickedBtn) {
  document.querySelectorAll('.nav-tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.module-section').forEach(s => s.classList.remove('active'));

  if (clickedBtn) clickedBtn.classList.add('active');
  const section = document.getElementById(sectionId);
  if (section) {
    section.classList.add('active');
  }
  playBeep(440, 'sine', 0.05);
}

// Lazy Prompt Preset Switcher
function initPresetSelectors() {
  const tabs = document.querySelectorAll('.preset-tab');
  const promptInput = document.getElementById('promptInputArea');
  const details = document.getElementById('presetSummaryDetails');
  const btnPlan = document.getElementById('btnPlanScope');
  const btnQuickDispatch = document.getElementById('btnQuickDispatch');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const presetKey = tab.getAttribute('data-preset');
      loadScenario(presetKey);
      playBeep(520, 'sine', 0.06);
    });
  });

  if (btnPlan) {
    btnPlan.addEventListener('click', () => {
      triggerPlanSimulation();
    });
  }

  if (btnQuickDispatch) {
    btnQuickDispatch.addEventListener('click', () => {
      if (state.currentStage === 'no_plan') {
        triggerPlanSimulation(() => {
          setTimeout(() => triggerExecuteSimulation(), 600);
        });
      } else {
        triggerExecuteSimulation();
      }
    });
  }
}

function loadScenario(presetKey) {
  state.activeScenario = presetKey;
  const p = SCENARIO_PRESETS[presetKey];
  if (!p) return;

  const promptInput = document.getElementById('promptInputArea');
  const details = document.getElementById('presetSummaryDetails');
  if (promptInput) promptInput.value = p.prompt;
  if (details) {
    details.innerHTML = `
      <span class="tag"><strong>${p.title}</strong></span>
      <span class="tag">${p.summary}</span>
    `;
  }

  // Preload contracts
  state.associates = JSON.parse(JSON.stringify(p.contracts)).map(c => ({
    ...c,
    status: 'idle',
    progress: 0
  }));

  // Update preview mode recommendation
  if (presetKey === 'full' || presetKey === 'team-full') {
    switchPreviewApp('finance');
  } else {
    switchPreviewApp('todo');
  }
}

// ============================================================================
// GUIDED FLOW STATE MACHINE
// ============================================================================
function updateGuidedFlow(stageKey) {
  state.currentStage = stageKey;
  const flow = GUIDED_FLOW_MAP[stageKey] || GUIDED_FLOW_MAP.no_plan;

  const stateText = document.getElementById('guidedStateText');
  const mainCmd = document.getElementById('guidedMainCommand');
  const altContainer = document.getElementById('guidedAltCommands');

  if (stateText) stateText.innerHTML = `State: <strong>${flow.stateLabel}</strong>`;
  if (mainCmd) mainCmd.textContent = flow.mainCmd;

  if (altContainer) {
    altContainer.innerHTML = '';
    flow.alts.forEach(alt => {
      const btn = document.createElement('button');
      btn.className = 'flow-alt-cmd';
      btn.textContent = alt;
      btn.onclick = () => terminalRunCommand(alt);
      altContainer.appendChild(btn);
    });
  }

  // Update nav bar badges
  const cycleBadge = document.getElementById('navCycleBudget');
  if (cycleBadge) {
    cycleBadge.textContent = `Cycle ${state.cycleCount}/${state.cycleMax} (Bounded)`;
  }
  const worktreeCount = document.getElementById('navWorktreeCount');
  if (worktreeCount) {
    worktreeCount.textContent = `${state.activeWorktrees} Active`;
  }
}

// ============================================================================
// DYNAMIC CUBICLE FACTORY SIMULATION LOGIC
// ============================================================================
function initSimulationControls() {
  document.getElementById('btnSimPlan')?.addEventListener('click', () => triggerPlanSimulation());
  document.getElementById('btnSimExecute')?.addEventListener('click', () => triggerExecuteSimulation());
  document.getElementById('btnSimDebug')?.addEventListener('click', () => triggerDebugSimulation());
  document.getElementById('btnSimDeploy')?.addEventListener('click', () => triggerDeploySimulation());
  document.getElementById('btnSimReset')?.addEventListener('click', () => resetCubicleFactory());
}

function resetCubicleFactory() {
  state.cycleCount = 1;
  state.activeWorktrees = 0;
  loadScenario(state.activeScenario);
  renderCubicleGrid(false);
  updateGuidedFlow('no_plan');
  updateStepper(1);

  document.getElementById('cubicleStageLabel').innerHTML = '<span class="status-dot blue"></span> STATUS: CUBICLE IDLE — AWAITING PLAN';
  document.getElementById('cubicleCapacityLabel').textContent = 'Capacity: 0 Cells active';
  document.getElementById('activeCycleBadge').textContent = 'Cycle: 0 / 3';

  addLogLine('[Reset] Cubicle floor cleared. Worktrees unmounted.', 'info');
  showToast('Cubicle factory reset to baseline', 'info');
  playBeep(330, 'sawtooth', 0.1);
}

function updateStepper(stepIndex) {
  for (let i = 1; i <= 5; i++) {
    const node = document.getElementById(`stepNode${i}`);
    const conn = document.getElementById(`stepConn${i}`);
    if (!node) continue;

    if (i < stepIndex) {
      node.classList.remove('active');
      node.classList.add('completed');
      if (conn) conn.classList.add('active');
    } else if (i === stepIndex) {
      node.classList.add('active');
      node.classList.remove('completed');
      if (conn) conn.classList.remove('active');
    } else {
      node.classList.remove('active', 'completed');
      if (conn) conn.classList.remove('active');
    }
  }
}

// 1. Plan Simulation
function triggerPlanSimulation(onComplete) {
  addLogLine('----------------------------------------------------');
  addLogLine('[Prepare] Initializing Git baseline: 7d14a92c...', 'info');
  addLogLine('[Research] Scanning module tree exports. Disjoint scopes requested...', 'info');

  updateStepper(2);
  playBeep(620, 'sine', 0.1);

  const stageLabel = document.getElementById('cubicleStageLabel');
  if (stageLabel) {
    stageLabel.innerHTML = '<span class="status-dot amber"></span> STATUS: PLANNING — EXPANDING CUBICLE CELLS...';
  }

  // Populate associates according to scenario
  const p = SCENARIO_PRESETS[state.activeScenario];
  state.associates = JSON.parse(JSON.stringify(p.contracts)).map(c => ({
    ...c,
    status: 'idle',
    progress: 0
  }));

  setTimeout(() => {
    // Check for collisions (Over-approximation)
    addLogLine('[Validator] Layer 1 Check: Analyzing contract paths for overlapping scopes...', 'info');
    addLogLine(`[Validator] 0 collisions found across ${state.associates.length} contracts. Over-approximation verified.`, 'success');
    addLogLine('[Plan] Generated CUBICORE_PLAN.md & CUBICORE_PLAN.json.', 'success');
    addLogLine('[Notice] DISPATCH NOTHING: Founder reviews plan first.', 'warning');

    renderCubicleGrid(true);
    updateGuidedFlow('after_plan');

    if (stageLabel) {
      stageLabel.innerHTML = `<span class="status-dot green"></span> STATUS: CUBICLE LOCKED — ${state.associates.length} ASSOCIATES READY`;
    }
    document.getElementById('cubicleCapacityLabel').textContent = `Capacity: ${state.associates.length} Cells Provisioned`;

    showToast(`Cubicle expanded to ${state.associates.length} cells. Plan ready.`, 'success');
    if (onComplete) onComplete();
  }, 700);
}

// 2. Execute Simulation
function triggerExecuteSimulation() {
  if (state.associates.length === 0) {
    triggerPlanSimulation(() => triggerExecuteSimulation());
    return;
  }

  updateStepper(3);
  updateGuidedFlow('run_in_flight');
  state.activeWorktrees = state.associates.length;

  document.getElementById('navWorktreeCount').textContent = `${state.activeWorktrees} Active`;
  document.getElementById('activeCycleBadge').textContent = `Cycle: ${state.cycleCount} / ${state.cycleMax}`;
  document.getElementById('cubicleStageLabel').innerHTML = '<span class="status-dot green"></span> STATUS: PARALLEL DISPATCH — WORKTREES ACTIVE';

  addLogLine('[Execute] Dispatching plan: Summoning 1 associate per contract in parallel...', 'info');
  addLogLine(`[Worktree] Provisioning ${state.associates.length} isolated git worktrees on disk...`, 'info');

  playBeep(740, 'triangle', 0.15);

  // Animate progress on all cards
  state.associates.forEach((assoc, idx) => {
    assoc.status = 'writing';
    const cardEl = document.getElementById(`assoc-card-${assoc.id}`);
    if (cardEl) {
      cardEl.className = 'associate-card status-active';
      const badge = cardEl.querySelector('.assoc-status-badge');
      if (badge) badge.className = 'badge badge-accent assoc-status-badge';
      if (badge) badge.textContent = 'Writing Worktree';
    }

    // Step animation
    let prog = 0;
    const interval = setInterval(() => {
      prog += Math.floor(Math.random() * 25) + 15;
      if (prog >= 100) {
        prog = 100;
        clearInterval(interval);
        assoc.progress = 100;
        assoc.status = 'verifying';

        const bar = cardEl?.querySelector('.assoc-progress-fill');
        if (bar) bar.style.width = '100%';

        const b = cardEl?.querySelector('.assoc-status-badge');
        if (b) {
          b.className = 'badge badge-warning assoc-status-badge';
          b.textContent = 'Verifying Matrix';
        }

        addLogLine(`[${assoc.name}] Contract ${assoc.id} work completed (Step ${Math.floor(Math.random() * 40) + 40}/120). Checks pending.`, 'info');

        // Check if all finished
        if (state.associates.every(a => a.progress === 100)) {
          completeExecutionPhase();
        }
      } else {
        assoc.progress = prog;
        const bar = cardEl?.querySelector('.assoc-progress-fill');
        if (bar) bar.style.width = `${prog}%`;
      }
    }, 180 + idx * 50);
  });
}

function completeExecutionPhase() {
  updateStepper(4);
  updateGuidedFlow('after_run');
  addLogLine('[Scope Gate] Layer 3 audit: Comparing declared writes against actual worktree diffs...', 'info');
  addLogLine('[Scope Gate] 0 stray files detected outside write scopes. Integrity confirmed.', 'success');
  addLogLine('[Notice] Worktree files staged. Run /cubicore:debug or /cubicore:preview.', 'warning');

  showToast('Parallel execution finished. Awaiting mechanical verification.', 'info');
  playBeep(880, 'sine', 0.2);
}

// 3. Debug Matrix Simulation
function triggerDebugSimulation() {
  if (state.associates.length === 0) {
    showToast('Plan and Execute must be run first.', 'warning');
    return;
  }

  updateStepper(4);
  updateGuidedFlow('issues_found');

  addLogLine('----------------------------------------------------');
  addLogLine('[Debug] Running mechanical check matrix across all associates...', 'info');
  playBeep(440, 'sawtooth', 0.1);

  // Flip one check to fail momentarily, then self-heal
  let fixedCount = 0;
  state.associates.forEach((assoc, aIdx) => {
    assoc.status = 'debug';
    const cardEl = document.getElementById(`assoc-card-${assoc.id}`);
    if (cardEl) {
      cardEl.className = 'associate-card status-debug';
    }

    assoc.checks.forEach((chk, cIdx) => {
      // simulate check
      chk.passed = true;
      fixedCount++;
      const checkEl = document.getElementById(`check-${assoc.id}-${cIdx}`);
      if (checkEl) {
        checkEl.className = 'matrix-item pass';
        checkEl.innerHTML = `<span class="matrix-check-status">✓</span> <span>${chk.name}</span>`;
      }
    });

    setTimeout(() => {
      assoc.status = 'passed';
      if (cardEl) {
        cardEl.className = 'associate-card status-complete';
        const badge = cardEl.querySelector('.assoc-status-badge');
        if (badge) {
          badge.className = 'badge badge-success assoc-status-badge';
          badge.textContent = 'Gated & Merged';
        }
      }
    }, 400 + aIdx * 150);
  });

  setTimeout(() => {
    updateGuidedFlow('everything_passes');
    addLogLine(`[Debug Matrix] ${fixedCount} mechanical checks evaluated: ALL PASSED.`, 'success');
    addLogLine('[Scope Gate] Gated copy-back: Worktree files successfully merged to main repository.', 'success');
    addLogLine('[Debug] Judgement checks (readability, UX) logged as advisory (0 blocking).', 'info');
    addLogLine('[Ready] Ready to ship! Next: /cubicore:preview or /cubicore:deploy.', 'success');

    showToast('Mechanical matrix passed! Copied back to main branch.', 'success');
    playBeep(988, 'sine', 0.25);
  }, 1000);
}

// 4. Deploy Simulation
function triggerDeploySimulation() {
  updateStepper(5);
  addLogLine('----------------------------------------------------');
  addLogLine('[Deploy] Initializing deployment planner (/cubicore:deploy)...', 'info');
  addLogLine('[Tier Question] Target runtime environment: Edge / Static Node Host', 'info');
  addLogLine('[Recommendation] Selected stack: Vercel / Cloudflare Pages / Static CDN', 'info');
  addLogLine('[Deployment] Created vercel.json, Dockerfile, and CUBICORE_DEPLOY.md.', 'success');
  addLogLine('[Notice] DEPLOYS NOTHING AUTOMATICALLY. Manual founder command instructions provided.', 'warning');

  showToast('Deployment files generated. Ready for production release!', 'success');
  playBeep(1046, 'sine', 0.3);

  // Switch to preview tab to see the live app
  setTimeout(() => {
    const previewTabBtn = document.querySelector('.nav-tab-btn[data-target="preview-section"]');
    if (previewTabBtn) previewTabBtn.click();
  }, 800);
}

// Render Cubicle Grid Cards
function renderCubicleGrid(hasExpanded) {
  const grid = document.getElementById('cubicleGrid');
  if (!grid) return;

  if (!hasExpanded || state.associates.length === 0) {
    grid.innerHTML = `
      <div class="cubicle-empty-state" id="cubicleEmptyPlaceholder">
        <div class="empty-icon">🏢</div>
        <h3>Cubicle Has Not Expanded Yet</h3>
        <p>Click <strong>"1. Plan (/plan)"</strong> or enter a prompt above to watch the factory dynamically scale its cubicle cells and provision sub-agent associates.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = '';
  state.associates.forEach(assoc => {
    const card = document.createElement('div');
    card.className = 'associate-card';
    card.id = `assoc-card-${assoc.id}`;

    const checkItemsHtml = assoc.checks.map((chk, i) => `
      <div class="matrix-item ${chk.passed ? 'pass' : 'pending'}" id="check-${assoc.id}-${i}">
        <span class="matrix-check-status">${chk.passed ? '✓' : '○'}</span>
        <span>${chk.name}</span>
      </div>
    `).join('');

    card.innerHTML = `
      <div class="associate-card-top">
        <div class="associate-avatar-block">
          <div class="assoc-avatar">${assoc.name.substring(0, 2).toUpperCase()}</div>
          <div class="assoc-meta">
            <div class="assoc-id">${assoc.name}</div>
            <div class="assoc-role">${assoc.role}</div>
          </div>
        </div>
        <span class="badge badge-outline assoc-status-badge">Standby</span>
      </div>

      <div class="associate-scope-box">
        <span class="scope-label">Disjoint Write Scope:</span>
        <span class="scope-path">${assoc.scope}</span>
      </div>

      <div class="associate-worktree-box">
        <span>Worktree Isolate:</span>
        <span class="wt-badge">${assoc.worktree}</span>
      </div>

      <div class="associate-check-matrix">
        <div class="matrix-label">
          <span>MECHANICAL CHECKS</span>
          <span>GATE: BLOCKING</span>
        </div>
        <div class="matrix-items-list">
          ${checkItemsHtml}
        </div>
      </div>

      <div class="associate-progress-bar">
        <div class="assoc-progress-fill" style="width: ${assoc.progress}%"></div>
      </div>
    `;

    grid.appendChild(card);
  });
}

function addLogLine(text, type = 'normal') {
  const stream = document.getElementById('cubicleLogStream');
  if (!stream) return;

  const div = document.createElement('div');
  div.className = `log-line ${type ? 'text-' + type : ''}`;
  div.textContent = text;
  stream.appendChild(div);
  stream.scrollTop = stream.scrollHeight;
}

// ============================================================================
// INTERACTIVE 14-COMMAND TERMINAL
// ============================================================================
function initTerminal() {
  const input = document.getElementById('terminalInput');
  const btnSend = document.getElementById('btnTermSend');

  if (input) {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const cmd = input.value.trim();
        if (cmd) {
          terminalRunCommand(cmd);
          input.value = '';
        }
      }
    });
  }

  if (btnSend) {
    btnSend.addEventListener('click', () => {
      if (input && input.value.trim()) {
        terminalRunCommand(input.value.trim());
        input.value = '';
      }
    });
  }
}

function terminalRunCommand(rawCmd) {
  const cmd = rawCmd.trim();
  const termBody = document.getElementById('terminalOutput');
  if (!termBody) return;

  playBeep(580, 'sine', 0.05);

  // Echo command
  const echoLine = document.createElement('div');
  echoLine.className = 'term-line term-cmd-echo';
  echoLine.textContent = `founder@cubicore:~$ ${cmd}`;
  termBody.appendChild(echoLine);

  const cleanCmd = cmd.toLowerCase().split(' ')[0];

  let outputHtml = '';
  let nextPrompt = '';

  switch (cleanCmd) {
    case '/cubicore:plan-demo':
      loadScenario('demo');
      triggerPlanSimulation();
      outputHtml = `
[PREPARE] Initialized git baseline (sha: 7d14a92c)
[RESEARCH] Analyzed module tree. Disjoint scopes computed for 3 contracts.
[SCOPE DECISION] Solo — Demo mode. Boring conventional stack selected.
[ARTIFACTS]
  ✓ CUBICORE_PLAN.md (Summary + contracts + graphBudget)
  ✓ CUBICORE_PLAN.json (Dispatchable AST structure)
  ✓ CUBICORE_CONTEXT.md (Human presentation narrative)
[SCOPE GATE] Over-approximation check: 0 collisions detected.
[STATUS] Dispatched NOTHING. Founder reviews plan before execution.`;
      nextPrompt = 'Next: /cubicore:execute · estimate · refine';
      break;

    case '/cubicore:plan-full':
      loadScenario('full');
      triggerPlanSimulation();
      outputHtml = `
[PREPARE] Git baseline recorded.
[RESEARCH] Scoped full product mode: 6 disjoint contracts.
[ARTIFACTS]
  ✓ CUBICORE_PLAN.md (6 contracts: UI, Storage, Exporter, Chart, DB, Matrix)
  ✓ CUBICORE_PLAN.json (6 worktree allocations)
  ✓ CUBICORE_CONTEXT.md (Founder pitch & investor metrics)
[STATUS] Plan ready. Dispatched nothing.`;
      nextPrompt = 'Next: /cubicore:execute · estimate · refine';
      break;

    case '/cubicore:execute':
      triggerExecuteSimulation();
      outputHtml = `
[EXECUTE] Dispatching plan: Summoning ${state.associates.length || 3} associates in parallel.
[ISOLATION] Layer 2 Git worktrees mounted:
  • .git/worktrees/wt-assoc-01/
  • .git/worktrees/wt-assoc-02/
  • .git/worktrees/wt-assoc-03/
[STEP BOUND] Enforcing 120-step budget ceiling per associate.
[PARALLEL] Tasks running concurrently in isolated filesystems...`;
      nextPrompt = 'Next: /cubicore:status';
      break;

    case '/cubicore:status':
      outputHtml = `
[STATUS REPORT]
  Active Stage : ${state.currentStage}
  Worktrees    : ${state.activeWorktrees} mounted
  Cycle Budget : ${state.cycleCount} of ${state.cycleMax} (Finite bounded loop)
  Associates   : ${state.associates.map(a => `${a.name} [${a.status}]`).join(', ')}
  Scope Gates  : Active (Airtight filesystem barrier)`;
      nextPrompt = state.currentStage === 'after_run' 
        ? 'Next: /cubicore:preview · debug · refine · undo · continue'
        : 'Next: /cubicore:execute · estimate · refine';
      break;

    case '/cubicore:debug':
      triggerDebugSimulation();
      outputHtml = `
[DEBUG MATRIX] Reviewing, testing, and fixing delivered work.
[AUDIT] Running mechanical check matrix against declared write scopes:
  ✓ Syntax verification: 0 errors
  ✓ DOM/Component structure: 0 missing elements
  ✓ State mutation invariants: Verified
[JUDGEMENT] Visual aesthetic & UX reported as advisory (non-blocking).
[SCOPES] Disjoint copy-back completed without merge conflicts.
[ARTIFACT] Written CUBICORE_DEBUG.md.`;
      nextPrompt = 'Next: /cubicore:preview · deploy · refine';
      break;

    case '/cubicore:preview':
      // Switch tab to preview
      const previewTab = document.querySelector('.nav-tab-btn[data-target="preview-section"]');
      if (previewTab) previewTab.click();
      outputHtml = `
[PREVIEW] Launching application from plan's preview block...
[SERVER] HTTP server listening on http://localhost:3000/app
[VERIFICATION] Live preview opened in UI tab. "A contract can be correct and still not run."`;
      nextPrompt = 'Next: /cubicore:deploy · debug · refine';
      break;

    case '/cubicore:deploy':
      triggerDeploySimulation();
      outputHtml = `
[DEPLOY] Generating production deployment plan.
[QUESTIONS]
  • Tier: Static Edge / Node.js
  • Recommendation: Cloudflare Pages / Vercel Edge
[OUTPUT] Generated deploy configuration files.
[NOTICE] Deploys nothing itself. Review manual deployment commands in CUBICORE_DEPLOY.md.`;
      nextPrompt = 'Next: /cubicore:preview · refine · undo';
      break;

    case '/cubicore:estimate':
      outputHtml = `
[ESTIMATE REPORT]
  Associates Needed : ${state.associates.length || 3}
  Token Ceiling     : 25.0M Cache Reads (vs 96.0M Naive Fan-out: 3.5× cheaper)
  Wall Clock Bound  : ~140 seconds
  Worktree Budget   : 3 isolated worktree allocations
  Cycle Ceiling     : ≤ 3 repair loops (Infinite recursion prevented)`;
      nextPrompt = 'Next: /cubicore:execute · refine';
      break;

    case '/cubicore:continue':
      outputHtml = `
[CONTINUE] Resuming run from last checkpoint...
  • Skipped 2 contracts already verified.
  • Dispatching 1 remaining contract.
  • Exempt from cycle budget penalty.`;
      nextPrompt = 'Next: /cubicore:debug · preview';
      break;

    case '/cubicore:refine':
      outputHtml = `
[REFINE] Mandatory iterative editing mode engaged.
  • Retaining passed contracts (cost = 0 tokens).
  • Modifying requested feature additions only.
  • Cycle 2 cost reflects diff, not full project.`;
      nextPrompt = 'Next: /cubicore:execute · estimate';
      break;

    case '/cubicore:undo':
      resetCubicleFactory();
      outputHtml = `
[UNDO] Reverting working tree to clean baseline commit sha (7d14a92c).
  • Removed all associate worktrees.
  • Destroyed staged changes.
  • Workspace restored to baseline.`;
      nextPrompt = 'Next: /cubicore:plan-demo or /cubicore:plan-full';
      break;

    case 'help':
      outputHtml = `
Available Cubicore MCP Commands:
  /cubicore:plan-demo   Fresh start in demo/MVP mode (3 contracts)
  /cubicore:plan-full   Full product mode (6-12 contracts)
  /cubicore:execute     Parallel dispatch in isolated git worktrees
  /cubicore:continue    Resume interrupted run, skipping passed contracts
  /cubicore:debug       Run mechanical matrix and auto-fix syntax errors
  /cubicore:refine      Iteratively edit plan/code without destroying work
  /cubicore:estimate    Inspect token & wall-clock budget before spending
  /cubicore:preview     Run app on localhost to verify real interaction
  /cubicore:deploy      Plan production deployment files & stack choice
  /cubicore:status      Inspect in-flight worktrees and progress
  /cubicore:undo        Discard changes and restore git baseline commit
  clear                 Clear terminal window`;
      nextPrompt = 'Next: Type a command above';
      break;

    case 'clear':
      terminalClear();
      return;

    default:
      outputHtml = `[ERROR] Unknown command '${cleanCmd}'. Type 'help' to view the 14 Cubicore factory commands.`;
      nextPrompt = 'Next: /cubicore:plan-demo';
      break;
  }

  const outBlock = document.createElement('div');
  outBlock.className = 'term-line term-output-block';
  outBlock.innerHTML = outputHtml.replace(/\n/g, '<br>');
  termBody.appendChild(outBlock);

  if (nextPrompt) {
    const guideDiv = document.createElement('div');
    guideDiv.className = 'term-line term-next-guide';
    guideDiv.innerHTML = `<strong>The flow guides itself:</strong> ${nextPrompt}`;
    termBody.appendChild(guideDiv);
  }

  termBody.scrollTop = termBody.scrollHeight;
}

function terminalClear() {
  const termBody = document.getElementById('terminalOutput');
  if (termBody) {
    termBody.innerHTML = `
      <div class="term-line banner">CUBICORE TERMINAL CLEARED</div>
      <div class="term-line text-muted">Ready for commands. Try "/cubicore:plan-demo"</div>
      <div class="term-divider"></div>
    `;
  }
}

// ============================================================================
// LIVE APPLICATION PREVIEW (/CUBICORE:PREVIEW)
// ============================================================================
function initPreviewApps() {
  const btnTodo = document.getElementById('btnPreviewTodo');
  const btnFinance = document.getElementById('btnPreviewFinance');
  const btnReload = document.getElementById('btnPreviewReload');

  if (btnTodo) {
    btnTodo.addEventListener('click', () => {
      btnTodo.classList.add('active');
      btnFinance?.classList.remove('active');
      switchPreviewApp('todo');
    });
  }

  if (btnFinance) {
    btnFinance.addEventListener('click', () => {
      btnFinance.classList.add('active');
      btnTodo?.classList.remove('active');
      switchPreviewApp('finance');
    });
  }

  if (btnReload) {
    btnReload.addEventListener('click', () => {
      playBeep(600, 'sine', 0.08);
      renderPreviewScreen();
      showToast('Preview reloaded from localhost:3000', 'info');
    });
  }

  renderPreviewScreen();
}

function switchPreviewApp(type) {
  state.activePreview = type;
  const urlDisplay = document.getElementById('previewUrlDisplay');
  if (urlDisplay) {
    urlDisplay.textContent = type === 'todo' ? 'http://localhost:3000/todo' : 'http://localhost:3000/finance-tracker';
  }
  renderPreviewScreen();
}

function renderPreviewScreen() {
  const container = document.getElementById('previewScreenContainer');
  if (!container) return;

  if (state.activePreview === 'todo') {
    renderTodoApp(container);
  } else {
    renderFinanceApp(container);
  }
}

// 1. Todo App Demo Renderer
function renderTodoApp(container) {
  container.innerHTML = `
    <div class="todo-app-screen">
      <div class="todo-header">
        <h3 class="todo-title"><span>📝</span> Tasks & Contracts</h3>
        <span class="badge badge-accent">Local Engine</span>
      </div>
      <div class="todo-input-row">
        <input type="text" id="newTodoInput" class="todo-input-field" placeholder="Add a new task..." />
        <button class="btn btn-primary btn-sm" id="btnAddTodo">Add Task</button>
      </div>
      <ul class="todo-list-items" id="todoListUl">
        ${state.userTodos.map(item => `
          <li class="todo-item-row ${item.done ? 'done' : ''}" data-id="${item.id}">
            <div>
              <input type="checkbox" class="todo-check" ${item.done ? 'checked' : ''} onchange="toggleTodoItem(${item.id})"/>
              <span>${escapeHtml(item.text)}</span>
            </div>
            <button class="todo-del-btn" onclick="deleteTodoItem(${item.id})" title="Delete">&times;</button>
          </li>
        `).join('')}
      </ul>
      <div class="todo-footer-meta">
        <span>${state.userTodos.filter(t => !t.done).length} items remaining</span>
        <span class="text-muted">Verified by Cubicore Mechanical Matrix</span>
      </div>
    </div>
  `;

  document.getElementById('btnAddTodo')?.addEventListener('click', () => {
    const input = document.getElementById('newTodoInput');
    if (input && input.value.trim()) {
      state.userTodos.push({
        id: Date.now(),
        text: input.value.trim(),
        done: false
      });
      playBeep(700, 'sine', 0.05);
      renderPreviewScreen();
    }
  });
}

window.toggleTodoItem = function(id) {
  const item = state.userTodos.find(t => t.id === id);
  if (item) {
    item.done = !item.done;
    playBeep(item.done ? 800 : 500, 'sine', 0.05);
    renderPreviewScreen();
  }
};

window.deleteTodoItem = function(id) {
  state.userTodos = state.userTodos.filter(t => t.id !== id);
  playBeep(350, 'sawtooth', 0.06);
  renderPreviewScreen();
};

// 2. Personal Finance Tracker Renderer
function renderFinanceApp(container) {
  const totalIncome = 4500.00;
  const totalExpenses = state.userExpenses.reduce((sum, e) => sum + e.amount, 0);
  const netSavings = totalIncome - totalExpenses;

  container.innerHTML = `
    <div class="finance-app-screen">
      <div class="finance-metrics-strip">
        <div class="finance-metric-box">
          <div class="fin-label">Monthly Inflow</div>
          <div class="fin-value text-emerald">$${totalIncome.toFixed(2)}</div>
        </div>
        <div class="finance-metric-box">
          <div class="fin-label">Total Expenses</div>
          <div class="fin-value text-crimson">$${totalExpenses.toFixed(2)}</div>
        </div>
        <div class="finance-metric-box">
          <div class="fin-label">Net Savings</div>
          <div class="fin-value text-cyan">$${netSavings.toFixed(2)}</div>
        </div>
      </div>

      <div class="finance-table-box">
        <div class="finance-table-header">
          <h4>Transactions & Allocations</h4>
          <button class="btn btn-sm btn-outline" id="btnExportCsv">
            <span class="icon">📥</span> Export CSV
          </button>
        </div>

        <table class="fin-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Category</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            ${state.userExpenses.map(exp => `
              <tr>
                <td>${exp.date}</td>
                <td>${escapeHtml(exp.desc)}</td>
                <td><span class="badge badge-neutral">${exp.cat}</span></td>
                <td class="font-bold text-amber">-$${exp.amount.toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  document.getElementById('btnExportCsv')?.addEventListener('click', () => {
    exportFinanceCsv();
  });
}

function exportFinanceCsv() {
  playBeep(900, 'sine', 0.1);
  let csv = 'ID,Date,Description,Category,Amount\n';
  state.userExpenses.forEach(exp => {
    csv += `${exp.id},${exp.date},"${exp.desc}",${exp.cat},${exp.amount}\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'cubicore_finance_export.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showToast('CSV downloaded: cubicore_finance_export.csv', 'success');
}

// ============================================================================
// ARTIFACTS & CONTRACTS INSPECTOR
// ============================================================================
function initArtifactViewer() {
  const tabs = document.querySelectorAll('.artifact-tab');
  const codeBox = document.getElementById('artifactCodeContent');
  const btnCopy = document.getElementById('btnCopyArtifact');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const fileKey = tab.getAttribute('data-file');
      state.currentArtifact = fileKey;
      loadArtifact(fileKey);
      playBeep(520, 'sine', 0.05);
    });
  });

  if (btnCopy) {
    btnCopy.addEventListener('click', () => {
      const content = ARTIFACT_FILES[state.currentArtifact] || '';
      navigator.clipboard.writeText(content).then(() => {
        showToast('Artifact copied to clipboard!', 'success');
        playBeep(880, 'sine', 0.1);
      });
    });
  }

  loadArtifact('plan_md');
}

function loadArtifact(fileKey) {
  const codeBox = document.getElementById('artifactCodeContent');
  const pathMeta = document.getElementById('artifactFilePath');
  const sizeMeta = document.getElementById('artifactFileSize');

  const content = ARTIFACT_FILES[fileKey] || '';
  if (codeBox) codeBox.textContent = content;

  const names = {
    plan_md: 'CUBICORE_PLAN.md',
    plan_json: 'CUBICORE_PLAN.json',
    context_md: 'CUBICORE_CONTEXT.md',
    debug_md: 'CUBICORE_DEBUG.md'
  };

  if (pathMeta) pathMeta.textContent = `Path: ./${names[fileKey] || 'artifact'}`;
  if (sizeMeta) sizeMeta.textContent = `Size: ${(content.length / 1024).toFixed(1)} KB`;
}

// ============================================================================
// 3-LAYER COLLISION TESTER SIMULATOR
// ============================================================================
function initCollisionTester() {
  const btnTest = document.getElementById('btnTestCollision');
  if (!btnTest) return;

  btnTest.addEventListener('click', () => {
    const scopeA = (document.getElementById('scopeInputA')?.value || '').trim();
    const scopeB = (document.getElementById('scopeInputB')?.value || '').trim();
    const resultBox = document.getElementById('scopeTestResult');
    if (!resultBox) return;

    // Conservative over-approximation collision check logic
    const normalize = p => p.replace(/^\.\//, '').replace(/\/$/, '');
    const normA = normalize(scopeA);
    const normB = normalize(scopeB);

    const isColliding = 
      normA === normB || 
      normA.startsWith(normB + '/') || 
      normB.startsWith(normA + '/');

    if (isColliding) {
      playBeep(320, 'sawtooth', 0.15);
      resultBox.innerHTML = `
        <span class="status-indicator-badge red">COLLISION DETECTED</span>
        <span>Scope <code>${escapeHtml(scopeA)}</code> collides with <code>${escapeHtml(scopeB)}</code>. Conservative over-approximation rejects overlap before tokens are spent!</span>
      `;
    } else {
      playBeep(880, 'sine', 0.1);
      resultBox.innerHTML = `
        <span class="status-indicator-badge green">DISJOINT VERIFIED</span>
        <span>Scopes <code>${escapeHtml(scopeA)}</code> and <code>${escapeHtml(scopeB)}</code> are cleanly separated. Safe for parallel git worktrees.</span>
      `;
    }
  });
}

// ============================================================================
// SETUP WIZARD MODAL
// ============================================================================
function initSetupModal() {
  const modal = document.getElementById('setupModal');
  const btnOpen = document.getElementById('openSetupBtn');
  const btnClose = document.getElementById('btnCloseSetupModal');
  const btnCloseDone = document.getElementById('btnModalCloseDone');

  if (btnOpen) {
    btnOpen.addEventListener('click', (e) => {
      e.preventDefault();
      if (modal) modal.style.display = 'flex';
      playBeep(640, 'sine', 0.08);
    });
  }

  const closeModal = () => {
    if (modal) modal.style.display = 'none';
  };

  if (btnClose) btnClose.addEventListener('click', closeModal);
  if (btnCloseDone) btnCloseDone.addEventListener('click', closeModal);

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }
}

window.copySetupCode = function(text) {
  navigator.clipboard.writeText(text).then(() => {
    showToast(`Copied: ${text}`, 'success');
    playBeep(880, 'sine', 0.08);
  });
};

// ============================================================================
// TOAST NOTIFICATIONS & UTILS
// ============================================================================
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${type === 'success' ? '✓' : type === 'warning' ? '⚠' : 'ℹ'}</span>
    <span>${escapeHtml(message)}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 300);
  }, 3200);
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
}
