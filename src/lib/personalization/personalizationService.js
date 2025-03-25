// src/lib/personalization/personalizationService.js
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

/**
 * Service for managing content personalization
 */
export class PersonalizationService {
  constructor(userId) {
    this.userId = userId;
    this.userProfile = null;
    this.userPreferences = null;
    this.viewHistory = [];
    this.sessionData = {
      pageViews: [],
      interactions: [],
      startTime: Date.now(),
    };
  }

  async init() {
    if (!this.userId) return;

    try {
      const profileDoc = await getDoc(doc(db, 'user_profiles', this.userId));
      if (profileDoc.exists()) {
        this.userProfile = profileDoc.data();
      } else {
        this.userProfile = {
          interests: [],
          location: null,
          lastActive: new Date(),
        };
        await setDoc(doc(db, 'user_profiles', this.userId), this.userProfile);
      }

      const preferencesDoc = await getDoc(doc(db, 'user_preferences', this.userId));
      if (preferencesDoc.exists()) {
        this.userPreferences = preferencesDoc.data();
      } else {
        this.userPreferences = {
          theme: 'light',
          contentCategories: [],
          emailNotifications: true,
        };
        await setDoc(doc(db, 'user_preferences', this.userId), this.userPreferences);
      }

      const historyDoc = await getDoc(doc(db, 'view_history', this.userId));
      if (historyDoc.exists()) {
        this.viewHistory = historyDoc.data().items || [];
      }

      return {
        profile: this.userProfile,
        preferences: this.userPreferences,
        history: this.viewHistory,
      };
    } catch (error) {
      console.error('Error initializing personalization service:', error);
      throw error;
    }
  }

  async updateProfile(profileData) {
    if (!this.userId) return;

    try {
      const updatedProfile = {
        ...this.userProfile,
        ...profileData,
        lastActive: new Date(),
      };

      await updateDoc(doc(db, 'user_profiles', this.userId), updatedProfile);
      this.userProfile = updatedProfile;

      return this.userProfile;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  async updatePreferences(preferencesData) {
    if (!this.userId) return;

    try {
      const updatedPreferences = {
        ...this.userPreferences,
        ...preferencesData,
      };

      await updateDoc(doc(db, 'user_preferences', this.userId), updatedPreferences);
      this.userPreferences = updatedPreferences;

      return this.userPreferences;
    } catch (error) {
      console.error('Error updating user preferences:', error);
      throw error;
    }
  }

  async trackView(contentId, contentType, metadata = {}) {
    if (!this.userId) return;

    const viewEvent = {
      contentId,
      contentType,
      timestamp: new Date(),
      metadata,
    };

    this.sessionData.pageViews.push(viewEvent);
    this.viewHistory.unshift(viewEvent);

    if (this.viewHistory.length > 100) {
      this.viewHistory = this.viewHistory.slice(0, 100);
    }

    try {
      await setDoc(doc(db, 'view_history', this.userId), {
        items: this.viewHistory,
      });
    } catch (error) {
      console.error('Error tracking view:', error);
    }

    return viewEvent;
  }

  async trackInteraction(interactionType, elementId, metadata = {}) {
    if (!this.userId) return;

    const interactionEvent = {
      interactionType,
      elementId,
      timestamp: new Date(),
      metadata,
    };

    this.sessionData.interactions.push(interactionEvent);

    if (['click', 'form_submit', 'purchase'].includes(interactionType)) {
      try {
        await updateDoc(doc(db, 'user_profiles', this.userId), {
          lastInteraction: interactionEvent,
          lastActive: new Date(),
        });
      } catch (error) {
        console.error('Error updating last interaction:', error);
      }
    }

    return interactionEvent;
  }

  async saveSession() {
    if (!this.userId) return;

    this.sessionData.duration = Date.now() - this.sessionData.startTime;

    try {
      const sessionId = `${this.userId}_${Date.now()}`;
      await setDoc(doc(db, 'user_sessions', sessionId), this.sessionData);
    } catch (error) {
      console.error('Error saving session data:', error);
    }
  }

  async getRecommendations(contentType, limit = 5) {
    if (!this.userId) return [];

    try {
      const contentRef = doc(db, 'content_catalog', contentType);
      const contentDoc = await getDoc(contentRef);

      if (!contentDoc.exists()) return [];

      const allContent = contentDoc.data().items || [];
      const viewedIds = this.viewHistory
        .filter((item) => item.contentType === contentType)
        .map((item) => item.contentId);

      const candidates = allContent.filter((item) => !viewedIds.includes(item.id));

      if (this.userProfile && this.userProfile.interests.length > 0) {
        candidates.sort((a, b) => {
          const aMatch = a.tags.filter((tag) => this.userProfile.interests.includes(tag)).length;
          const bMatch = b.tags.filter((tag) => this.userProfile.interests.includes(tag)).length;
          return bMatch - aMatch;
        });
      }

      return candidates.slice(0, limit);
    } catch (error) {
      console.error('Error getting recommendations:', error);
      return [];
    }
  }

  getPersonalizationContext() {
    return {
      userId: this.userId,
      profile: this.userProfile || {},
      preferences: this.userPreferences || {},
      sessionData: {
        pageViewCount: this.sessionData.pageViews.length,
        interactionCount: this.sessionData.interactions.length,
        sessionDuration: Date.now() - this.sessionData.startTime,
      },
      device: {
        isMobile: window.innerWidth < 768,
        screenWidth: window.innerWidth,
        screenHeight: window.innerHeight,
      },
      location: {
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: navigator.language,
      },
      time: {
        hour: new Date().getHours(),
        day: new Date().getDay(),
        date: new Date().toISOString(),
      },
    };
  }
}
