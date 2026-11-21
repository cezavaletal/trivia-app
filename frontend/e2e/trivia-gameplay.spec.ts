import { test, expect } from '@playwright/test';

test.describe('Trivia Arena - Flujo de Usuario E2E Completo', () => {

  test.beforeEach(async ({ page }) => {
    // Interceptar API de Categorías
    await page.route('**/api/v1/categories', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 1,
            name: 'Ciencia y Naturaleza',
            slug: 'ciencia-y-naturaleza',
            description: 'Preguntas de física, química y biología',
            icon: 'flask',
            totalQuestions: 50
          },
          {
            id: 2,
            name: 'Historia Universal',
            slug: 'historia-universal',
            description: 'Acontecimientos y civilizaciones históricas',
            icon: 'landmark',
            totalQuestions: 40
          }
        ])
      });
    });

    // Interceptar Registro de Usuario
    await page.route('**/api/v1/auth/register', async route => {
      const body = route.request().postDataJSON();
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          tokenType: 'Bearer',
          accessToken: 'mock-jwt-token-playwright',
          expiresInSeconds: 3600,
          user: {
            id: 101,
            username: body.username || 'playwright_champ',
            email: body.email || 'champ@example.com',
            roles: ['ROLE_PLAYER'],
            createdAt: new Date().toISOString()
          }
        })
      });
    });

    // Interceptar Perfil del Usuario /auth/me
    await page.route('**/api/v1/auth/me', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 101,
          username: 'playwright_champ',
          email: 'champ@example.com',
          roles: ['ROLE_PLAYER'],
          stats: {
            gamesPlayed: 5,
            highestScore: 3200,
            totalCorrectAnswers: 42,
            bestStreak: 7
          }
        })
      });
    });

    // Generar 10 preguntas de prueba sanitizadas (anti-trampas: NUNCA tienen isCorrect)
    const mockQuestions = Array.from({ length: 10 }, (_, i) => ({
      id: 1000 + i,
      order: i + 1,
      categoryName: i % 2 === 0 ? 'Ciencia y Naturaleza' : 'Historia Universal',
      difficulty: 'MEDIUM',
      timeLimitSeconds: 15,
      text: `¿Pregunta cronometrada #${i + 1} de la Trivia Arena?`,
      options: [
        { id: 2000 + i * 4 + 1, text: `Respuesta Alfa #${i + 1}` },
        { id: 2000 + i * 4 + 2, text: `Respuesta Beta (Correcta) #${i + 1}` },
        { id: 2000 + i * 4 + 3, text: `Respuesta Gamma #${i + 1}` },
        { id: 2000 + i * 4 + 4, text: `Respuesta Delta #${i + 1}` }
      ]
    }));

    // Interceptar Inicio de Partida POST /api/v1/games
    await page.route('**/api/v1/games', async route => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            gameId: 888,
            gameMode: 'QUICK_PLAY',
            status: 'IN_PROGRESS',
            totalQuestions: 10,
            totalScore: 0,
            currentStreak: 0,
            createdAt: new Date().toISOString(),
            questions: mockQuestions
          })
        });
      } else {
        await route.continue();
      }
    });

    // Interceptar Respuestas POST /api/v1/games/888/answers
    let answeredCount = 0;
    await page.route('**/api/v1/games/888/answers', async route => {
      const postData = route.request().postDataJSON();
      answeredCount++;
      const currentScore = answeredCount * 300;
      const currentStreak = answeredCount;

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          questionId: postData.questionId,
          isCorrect: true,
          correctOptionId: postData.selectedOptionId,
          explanation: `Explicación verificada para la pregunta #${answeredCount}.`,
          scoreCalculation: {
            baseScore: 200,
            speedBonus: 50,
            currentStreak: currentStreak,
            streakMultiplier: 1.2,
            pointsAwarded: 300
          },
          gameProgress: {
            totalScore: currentScore,
            currentStreak: currentStreak,
            remainingQuestions: 10 - answeredCount
          }
        })
      });
    });

    // Interceptar Cierre de Partida POST /api/v1/games/888/finish
    await page.route('**/api/v1/games/888/finish', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          gameId: 888,
          status: 'COMPLETED',
          finalScore: 3000,
          correctAnswers: 10,
          incorrectAnswers: 0,
          maxStreak: 10,
          totalDurationSeconds: 45,
          accuracyPercentage: 100.0,
          leaderboardUpdate: {
            globalRank: 1,
            weeklyRank: 1,
            isPersonalBest: true
          },
          completedAt: new Date().toISOString()
        })
      });
    });

    // Interceptar Leaderboards
    await page.route('**/api/v1/leaderboard/global*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          currentUserRank: {
            rank: 1,
            userId: 101,
            username: 'playwright_champ',
            totalScore: 3000,
            gamesPlayed: 1,
            winRate: 100.0
          },
          topPlayers: {
            content: [
              {
                rank: 1,
                userId: 101,
                username: 'playwright_champ',
                totalScore: 3000,
                gamesPlayed: 1,
                accuracyPercentage: 100.0,
                badge: 'DIAMOND'
              },
              {
                rank: 2,
                userId: 55,
                username: 'TriviaMaster_99',
                totalScore: 2850,
                gamesPlayed: 15,
                accuracyPercentage: 91.5,
                badge: 'GOLD'
              },
              {
                rank: 3,
                userId: 66,
                username: 'Brain_Overload',
                totalScore: 2400,
                gamesPlayed: 12,
                accuracyPercentage: 86.0,
                badge: 'SILVER'
              }
            ],
            pageNumber: 0,
            pageSize: 20,
            totalElements: 3,
            totalPages: 1
          }
        })
      });
    });
  });

  test('Viaje del usuario: Registro -> Dashboard -> Partida Rápida (10 preguntas) -> Resultados -> Leaderboard', async ({ page }) => {
    // ========================================================
    // 1. Carga inicial y navegación a /register
    // ========================================================
    await page.goto('/register');
    await expect(page.locator('h1.auth-title')).toContainText('Crea tu Cuenta');

    // ========================================================
    // 2. Registro de nuevo jugador
    // ========================================================
    await page.fill('#username', 'playwright_champ');
    await page.fill('#email', 'champ@example.com');
    await page.fill('#password', 'Password123!');
    await page.click('button[type="submit"]');

    // Redirección al Dashboard
    await page.waitForURL('/');
    await expect(page.locator('.hero-title')).toContainText('Domina el Conocimiento');

    // Verificar estadísticas del usuario en el Dashboard
    await expect(page.locator('.stats-section')).toBeVisible();
    await expect(page.locator('.stats-section')).toContainText('Mis Estadísticas');

    // ========================================================
    // 3. Selección de Partida Rápida (Mix)
    // ========================================================
    const quickPlayBtn = page.locator('.btn-quick-play');
    await expect(quickPlayBtn).toBeVisible();
    await quickPlayBtn.click();

    // Redirección a la Arena de Juego
    await page.waitForURL('**/game/888');

    // ========================================================
    // 4. Interacción con la Arena de Juego (Preguntas y Opciones)
    // ========================================================
    // Validar HUD y temporizador
    await expect(page.locator('.arena-hud')).toBeVisible();
    await expect(page.locator('.hud-progress-info')).toContainText('1 / 10');
    await expect(page.locator('app-timer-bar')).toBeVisible();

    // Responder a las 10 preguntas
    for (let i = 1; i <= 10; i++) {
      // Verificar indicador de pregunta
      await expect(page.locator('.hud-progress-info')).toContainText(`${i} / 10`);

      // Seleccionar la segunda opción (Respuesta Beta)
      const optionButtons = page.locator('.answers-grid app-answer-button button');
      await expect(optionButtons.first()).toBeVisible();
      await optionButtons.nth(1).click();

      // Verificar feedback visual de respuesta
      await expect(page.locator('.feedback-banner')).toBeVisible();
      await expect(page.locator('.feedback-banner')).toContainText('¡CORRECTO!');

      // En la última pregunta, la aplicación transiciona automáticamente a /results
      if (i === 10) {
        await page.waitForURL('**/game/888/results', { timeout: 10000 });
      } else {
        // Esperar transición a la siguiente pregunta
        await expect(page.locator('.hud-progress-info')).toContainText(`${i + 1} / 10`, { timeout: 6000 });
      }
    }

    // ========================================================
    // 5. Pantalla de Resultados y Resumen
    // ========================================================
    await expect(page.locator('.celebration-badge')).toContainText('¡PARTIDA COMPLETADA!');
    await expect(page.locator('.score-value')).toContainText('3,000');
    await expect(page.locator('.metrics-grid')).toContainText('10 / 10'); // Aciertos
    await expect(page.locator('.metric--precision')).toContainText('100%'); // Precisión
    await expect(page.locator('.record-badge')).toBeVisible();

    // ========================================================
    // 6. Navegación a Leaderboard y Verificación de Rankings
    // ========================================================
    const leaderboardLink = page.locator('a[routerlink="/leaderboard"], a[href="/leaderboard"]');
    await leaderboardLink.first().click();

    await page.waitForURL('**/leaderboard');
    await expect(page.locator('.page-title')).toContainText('Tabla de Clasificación');

    // Verificar podio y tabla de posiciones
    await expect(page.locator('.podium-wrapper, app-podium')).toBeVisible();
    await expect(page.locator('.my-rank-banner')).toBeVisible();
    await expect(page.locator('.my-rank-name')).toContainText('playwright_champ');

    // Verificar tabla con el jugador en el puesto #1
    const firstRow = page.locator('.leaderboard-table tbody tr').first();
    await expect(firstRow).toContainText('playwright_champ');
    await expect(firstRow).toContainText('3,000');
  });

  test('Validación de Blindaje Anti-Trampas en el Frontend', async ({ page }) => {
    // Iniciar sesión y navegar directo a la arena
    await page.goto('/login');
    await page.fill('#usernameOrEmail', 'playwright_champ');
    await page.fill('#password', 'Password123!');

    // Mock login exitoso
    await page.route('**/api/v1/auth/login', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          tokenType: 'Bearer',
          accessToken: 'mock-jwt-token-login',
          expiresInSeconds: 3600,
          user: { id: 101, username: 'playwright_champ', email: 'champ@example.com', roles: ['ROLE_PLAYER'] }
        })
      });
    });

    await page.click('button[type="submit"]');
    await page.waitForURL('/');

    // Clic en Partida Rápida
    await page.click('.btn-quick-play');
    await page.waitForURL('**/game/888');

    // Inspeccionar el DOM para asegurar que NO existan atributos ni clases que delaten isCorrect antes de responder
    const buttons = page.locator('.answers-grid app-answer-button button');
    await expect(buttons).toHaveCount(4);

    for (let i = 0; i < 4; i++) {
      const btn = buttons.nth(i);
      const html = await btn.innerHTML();
      expect(html).not.toContain('isCorrect');
      expect(html).not.toContain('esCorrecta');
      expect(html).not.toContain('correct');
    }
  });
});
