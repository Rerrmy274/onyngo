/**
 * Stamford Auto Care - Centralized Data Manager
 * Version: 2.0
 * This file manages all customer data persistently
 */

const StamfordDataManager = {
  version: '2.0',
  
  // Initialize data structure
  init() {
    if (!localStorage.getItem('stamford_data_version')) {
      localStorage.setItem('stamford_data_version', this.version);
    }
    this.migrateData();
  },
  
  // Migrate old data to new structure
  migrateData() {
    const currentVersion = localStorage.getItem('stamford_data_version');
    if (currentVersion !== this.version) {
      console.log('Migrating data to version ' + this.version);
      // Future migration logic here
      localStorage.setItem('stamford_data_version', this.version);
    }
  },
  
  // User Management
  users: {
    getAll() {
      return JSON.parse(localStorage.getItem('stamford_users') || '[]');
    },
    save(users) {
      localStorage.setItem('stamford_users', JSON.stringify(users));
      localStorage.setItem('stamford_users_backup', JSON.stringify(users));
      localStorage.setItem('stamford_last_backup', new Date().toISOString());
    },
    add(user) {
      const users = this.getAll();
      users.push(user);
      this.save(users);
    },
    update(userId, userData) {
      const users = this.getAll();
      const index = users.findIndex(u => u.id === userId);
      if (index !== -1) {
        users[index] = { ...users[index], ...userData };
        this.save(users);
      }
    }
  },
  
  // Logged in user
  currentUser: {
    get() {
      return JSON.parse(localStorage.getItem('stamford_logged_user') || 'null');
    },
    set(user) {
      localStorage.setItem('stamford_logged_user', JSON.stringify(user));
    },
    clear() {
      localStorage.removeItem('stamford_logged_user');
    }
  },
  
  // Vehicles
  vehicles: {
    getAll() {
      return JSON.parse(localStorage.getItem('stamford_vehicles') || '[]');
    },
    save(vehicles) {
      localStorage.setItem('stamford_vehicles', JSON.stringify(vehicles));
    },
    add(vehicle) {
      const vehicles = this.getAll();
      vehicles.push(vehicle);
      this.save(vehicles);
    },
    delete(vehicleId) {
      const vehicles = this.getAll().filter(v => v.id !== vehicleId);
      this.save(vehicles);
    }
  },
  
  // Appointments
  appointments: {
    getAll() {
      return JSON.parse(localStorage.getItem('stamford_appointments') || '[]');
    },
    save(appointments) {
      localStorage.setItem('stamford_appointments', JSON.stringify(appointments));
    },
    add(appointment) {
      const appointments = this.getAll();
      appointments.push(appointment);
      this.save(appointments);
    },
    getByUser(userId) {
      return this.getAll().filter(a => a.userId === userId);
    }
  },
  
  // Car Clinics
  clinics: {
    getAll() {
      return JSON.parse(localStorage.getItem('stamford_clinics') || '[]');
    },
    save(clinics) {
      localStorage.setItem('stamford_clinics', JSON.stringify(clinics));
    },
    add(clinic) {
      const clinics = this.getAll();
      clinics.push(clinic);
      this.save(clinics);
    },
    getByUser(userId) {
      return this.getAll().filter(c => c.userId === userId);
    },
    getUpcoming(userId) {
      const today = new Date();
      return this.getByUser(userId).filter(c => {
        const clinicDate = new Date(c.date);
        return clinicDate >= today;
      }).sort((a, b) => new Date(a.date) - new Date(b.date));
    },
    getPast(userId) {
      const today = new Date();
      return this.getByUser(userId).filter(c => {
        const clinicDate = new Date(c.date);
        return clinicDate < today;
      }).sort((a, b) => new Date(b.date) - new Date(a.date));
    }
  },
  
  // Get next clinic date (first Saturday of next month)
  getNextClinicDate() {
    const now = new Date();
    let year = now.getFullYear();
    let month = now.getMonth() + 1; // Next month
    
    if (month > 11) {
      month = 0;
      year++;
    }
    
    // Find first Saturday
    const firstDay = new Date(year, month, 1);
    const dayOfWeek = firstDay.getDay();
    const daysUntilSaturday = dayOfWeek === 6 ? 0 : (6 - dayOfWeek + 7) % 7;
    const firstSaturday = new Date(year, month, 1 + daysUntilSaturday);
    
    return firstSaturday;
  },
  
  // Backup all data
  backup() {
    const allData = {
      version: this.version,
      timestamp: new Date().toISOString(),
      users: this.users.getAll(),
      vehicles: this.vehicles.getAll(),
      appointments: this.appointments.getAll(),
      clinics: this.clinics.getAll()
    };
    localStorage.setItem('stamford_full_backup', JSON.stringify(allData));
    return allData;
  },
  
  // Restore from backup
  restore(backupData) {
    if (backupData.users) this.users.save(backupData.users);
    if (backupData.vehicles) this.vehicles.save(backupData.vehicles);
    if (backupData.appointments) this.appointments.save(backupData.appointments);
    if (backupData.clinics) this.clinics.save(backupData.clinics);
  }
};

// Initialize on load
StamfordDataManager.init();
