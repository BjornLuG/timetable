import Vue from 'vue'
import Vuex from 'vuex'
import { isColorDark, parseTime } from '@/util'

/**
 * @typedef {object} Schedule
 * @property {string} name
 * @property {string} teacher
 * @property {string} location
 * @property {string} color
 * @property {number} day
 * @property {string} startTime
 * @property {string} endTime
 */

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    currentDate: new Date(),
    defaultColor: '#123456',
    /** @type {Schedule[]} */
    schedules: []
  },
  mutations: {
    RESET_DATE(state) {
      // Triggers re-calculations
      state.currentDate = new Date()
    },
    ADD_SCHEDULE(state, { schedule }) {
      state.schedules.push(schedule)
    },
    UPDATE_SCHEDULE(state, { index, schedule }) {
      state.schedules.splice(index, 1, schedule)
    },
    REMOVE_SCHEDULE(state, { index }) {
      state.schedules.splice(index, 1)
    }
  },
  actions: {
    resetDate({ commit }) {
      commit('RESET_DATE')
    },
    addSchedule({ commit, dispatch }, { schedule }) {
      dispatch('resetDate')
      commit('ADD_SCHEDULE', { schedule })
    },
    updateSchedule({ commit, dispatch }, { index, schedule }) {
      dispatch('resetDate')
      commit('UPDATE_SCHEDULE', { index, schedule })
    },
    removeSchedule({ commit, dispatch }, { index }) {
      dispatch('resetDate')
      commit('REMOVE_SCHEDULE', { index })
    }
  },
  getters: {
    currentSchedule(state, getters) {
      const day = state.currentDate.getDay()
      const hour = state.currentDate.getHours()
      const minute = state.currentDate.getMinutes()

      return getters.findSchedule(day, hour, minute)
    },
    nextSchedule(state, getters) {
      const day = state.currentDate.getDay()
      const hour = state.currentDate.getHours()
      const minute = state.currentDate.getMinutes()

      return getters.findNextSchedule(day, hour, minute)
    },
    currentColor(state, getters) {
      return getters.currentSchedule?.color ?? state.defaultColor
    },
    isCurrentColorDark(state, getters) {
      return isColorDark(getters.currentColor)
    },
    /** Finds a schedule for a time */
    findSchedule: state => (day, hour, minute) => {
      return state.schedules.find(schedule => {
        if (schedule.day !== day) {
          return false
        }

        const { hour: startHour, minute: startMinute } = parseTime(
          schedule.startTime
        )
        const { hour: endHour, minute: endMinute } = parseTime(schedule.endTime)

        return (
          (hour > startHour && hour < endHour) ||
          (hour === startHour && minute > startMinute) ||
          (hour === endHour && minute < endMinute)
        )
      })
    },
    /** Finds the next schedule for a time, limited to that day */
    findNextSchedule: (state, getters) => (day, hour, minute) => {
      return getters.sortedSchedules.find(schedule => {
        if (schedule.day !== day) {
          return false
        }

        const { hour: startHour, minute: startMinute } = parseTime(
          schedule.startTime
        )

        return hour <= startHour && minute < startMinute
      })
    },
    /** Sorts schedules ascendingly by day and startHour */
    sortedSchedules(state) {
      return state.schedules.sort((a, b) => {
        // Merge hour and minute to 24-hour format
        const startTimeA = parseInt(a.startTime.replace(':', ''), 10)
        const startTimeB = parseInt(b.startTime.replace(':', ''), 10)

        return a.day - b.day || startTimeA - startTimeB
      })
    },
    teachers(state) {
      return [...new Set(state.schedules.map(v => v.teacher).filter(Boolean))]
    },
    locations(state) {
      return [...new Set(state.schedules.map(v => v.location).filter(Boolean))]
    },
    colors(state) {
      return [...new Set(state.schedules.map(v => v.color).filter(Boolean))]
    }
  }
})
