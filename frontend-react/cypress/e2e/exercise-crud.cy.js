describe('Exercise CRUD Operations', () => {
  const testEmail = `exercise-test-${Date.now()}@example.com`;
  const testUsername = `exuser${Date.now()}`;
  const testPassword = 'password123';

  beforeEach(() => {
    // Register and login before each test
    cy.register(testEmail, testUsername, testPassword);
  });

  describe('Create Exercise', () => {
    it('should create first exercise', () => {
      cy.visit('/create');
      cy.get('input[placeholder="Exercise Name"]').type('Push-ups');
      cy.get('input[placeholder="Reps"]').type('20');
      cy.get('input[placeholder="Weight (lbs)"]').type('0');
      cy.get('select').select('reps');
      cy.get('input[type="date"]').type('2026-08-26');
      cy.get('button').contains('Create Exercise').click();

      cy.url().should('eq', 'http://localhost:5173/');
      cy.contains('Push-ups').should('be.visible');
    });

    it('should create second exercise', () => {
      cy.visit('/create');
      cy.get('input[placeholder="Exercise Name"]').type('Squats');
      cy.get('input[placeholder="Reps"]').type('15');
      cy.get('input[placeholder="Weight (lbs)"]').type('185');
      cy.get('select').select('lbs');
      cy.get('input[type="date"]').type('2026-08-26');
      cy.get('button').contains('Create Exercise').click();

      cy.url().should('eq', 'http://localhost:5173/');
      cy.contains('Squats').should('be.visible');
    });

    it('should show error for missing required fields', () => {
      cy.visit('/create');
      cy.get('input[placeholder="Exercise Name"]').type('Invalid Exercise');
      // Don't fill other required fields
      cy.get('button').contains('Create Exercise').click();

      // Should stay on create page
      cy.url().should('include', '/create');
    });
  });

  describe('Retrieve Exercises', () => {
    beforeEach(() => {
      // Create two exercises for retrieval tests
      cy.visit('/create');
      cy.get('input[placeholder="Exercise Name"]').type('Bench Press');
      cy.get('input[placeholder="Reps"]').type('10');
      cy.get('input[placeholder="Weight (lbs)"]').type('225');
      cy.get('select').select('lbs');
      cy.get('input[type="date"]').type('2026-08-25');
      cy.get('button').contains('Create Exercise').click();

      cy.visit('/create');
      cy.get('input[placeholder="Exercise Name"]').type('Deadlifts');
      cy.get('input[placeholder="Reps"]').type('5');
      cy.get('input[placeholder="Weight (lbs)"]').type('315');
      cy.get('select').select('lbs');
      cy.get('input[type="date"]').type('2026-08-26');
      cy.get('button').contains('Create Exercise').click();
    });

    it('should display all exercises in table', () => {
      cy.visit('/');
      cy.contains('Bench Press').should('be.visible');
      cy.contains('Deadlifts').should('be.visible');
    });

    it('should show exercise details correctly', () => {
      cy.visit('/');
      cy.contains('Bench Press')
        .closest('tr')
        .within(() => {
          cy.contains('10').should('be.visible');
          cy.contains('225').should('be.visible');
        });
    });
  });

  describe('Update Exercise', () => {
    beforeEach(() => {
      // Create an exercise to update
      cy.visit('/create');
      cy.get('input[placeholder="Exercise Name"]').type('Running');
      cy.get('input[placeholder="Reps"]').type('30');
      cy.get('input[placeholder="Weight (lbs)"]').type('0');
      cy.get('select').select('mins');
      cy.get('input[type="date"]').type('2026-08-26');
      cy.get('button').contains('Create Exercise').click();
    });

    it('should edit exercise details', () => {
      cy.visit('/');
      cy.contains('Running')
        .closest('tr')
        .within(() => {
          cy.get('button').contains('Edit').click();
        });

      cy.url().should('include', '/update');
      cy.get('input[placeholder="Exercise Name"]').clear().type('Jogging');
      cy.get('input[placeholder="Reps"]').clear().type('45');
      cy.get('button').contains('Update Exercise').click();

      cy.url().should('eq', 'http://localhost:5173/');
      cy.contains('Jogging').should('be.visible');
      cy.contains('45').should('be.visible');
    });

    it('should not allow invalid updates', () => {
      cy.visit('/');
      cy.contains('Running')
        .closest('tr')
        .within(() => {
          cy.get('button').contains('Edit').click();
        });

      cy.get('input[placeholder="Exercise Name"]').clear();
      cy.get('button').contains('Update Exercise').click();

      // Should show error
      cy.url().should('include', '/update');
    });
  });

  describe('Delete Exercise', () => {
    beforeEach(() => {
      // Create two exercises for deletion tests
      cy.visit('/create');
      cy.get('input[placeholder="Exercise Name"]').type('Exercise 1');
      cy.get('input[placeholder="Reps"]').type('10');
      cy.get('input[placeholder="Weight (lbs)"]').type('100');
      cy.get('select').select('lbs');
      cy.get('input[type="date"]').type('2026-08-26');
      cy.get('button').contains('Create Exercise').click();

      cy.visit('/create');
      cy.get('input[placeholder="Exercise Name"]').type('Exercise 2');
      cy.get('input[placeholder="Reps"]').type('20');
      cy.get('input[placeholder="Weight (lbs)"]').type('200');
      cy.get('select').select('lbs');
      cy.get('input[type="date"]').type('2026-08-26');
      cy.get('button').contains('Create Exercise').click();
    });

    it('should delete first exercise', () => {
      cy.visit('/');
      cy.contains('Exercise 1').should('be.visible');

      cy.contains('Exercise 1')
        .closest('tr')
        .within(() => {
          cy.get('button').contains('Delete').click();
        });

      // Confirm deletion
      cy.on('window:confirm', () => true);

      cy.contains('Exercise 1').should('not.exist');
      cy.contains('Exercise 2').should('be.visible');
    });

    it('should delete second exercise', () => {
      cy.visit('/');
      cy.contains('Exercise 2').should('be.visible');

      cy.contains('Exercise 2')
        .closest('tr')
        .within(() => {
          cy.get('button').contains('Delete').click();
        });

      // Confirm deletion
      cy.on('window:confirm', () => true);

      cy.contains('Exercise 2').should('not.exist');
      cy.contains('Exercise 1').should('be.visible');
    });

    it('should delete all exercises', () => {
      cy.visit('/');
      cy.contains('Exercise 1').should('be.visible');
      cy.contains('Exercise 2').should('be.visible');

      // Delete first exercise
      cy.contains('Exercise 1')
        .closest('tr')
        .within(() => {
          cy.get('button').contains('Delete').click();
        });
      cy.on('window:confirm', () => true);

      // Delete second exercise
      cy.contains('Exercise 2')
        .closest('tr')
        .within(() => {
          cy.get('button').contains('Delete').click();
        });
      cy.on('window:confirm', () => true);

      // Table should be empty (no exercises)
      cy.contains('Exercise 1').should('not.exist');
      cy.contains('Exercise 2').should('not.exist');
    });
  });

  describe('Full User Workflow', () => {
    it('should complete entire workflow: create 2, edit 1, delete all', () => {
      // 1. Create first exercise
      cy.visit('/create');
      cy.get('input[placeholder="Exercise Name"]').type('Workout 1');
      cy.get('input[placeholder="Reps"]').type('25');
      cy.get('input[placeholder="Weight (lbs)"]').type('150');
      cy.get('select').select('lbs');
      cy.get('input[type="date"]').type('2026-08-26');
      cy.get('button').contains('Create Exercise').click();
      cy.contains('Workout 1').should('be.visible');

      // 2. Create second exercise
      cy.visit('/create');
      cy.get('input[placeholder="Exercise Name"]').type('Workout 2');
      cy.get('input[placeholder="Reps"]').type('30');
      cy.get('input[placeholder="Weight (lbs)"]').type('175');
      cy.get('select').select('lbs');
      cy.get('input[type="date"]').type('2026-08-26');
      cy.get('button').contains('Create Exercise').click();
      cy.contains('Workout 2').should('be.visible');

      // 3. Edit first exercise
      cy.visit('/');
      cy.contains('Workout 1')
        .closest('tr')
        .within(() => {
          cy.get('button').contains('Edit').click();
        });
      cy.get('input[placeholder="Exercise Name"]').clear().type('Updated Workout 1');
      cy.get('input[placeholder="Reps"]').clear().type('35');
      cy.get('button').contains('Update Exercise').click();
      cy.contains('Updated Workout 1').should('be.visible');
      cy.contains('35').should('be.visible');

      // 4. Delete first exercise
      cy.contains('Updated Workout 1')
        .closest('tr')
        .within(() => {
          cy.get('button').contains('Delete').click();
        });
      cy.on('window:confirm', () => true);
      cy.contains('Updated Workout 1').should('not.exist');

      // 5. Delete second exercise
      cy.contains('Workout 2')
        .closest('tr')
        .within(() => {
          cy.get('button').contains('Delete').click();
        });
      cy.on('window:confirm', () => true);
      cy.contains('Workout 2').should('not.exist');
    });
  });
});
