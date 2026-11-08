import { afterEach, describe, expect, it, vi } from "vitest"
import {
  getCurrentWeekSchedule,
  getDayNameSpanish,
  getDaySchedule,
  getShiftForTeam,
  getShiftLabelSpanish,
  getWeekOfYear,
} from "./rotation"

const mondayWeek1 = new Date(2024, 0, 1)
const mondayWeek2 = new Date(2024, 0, 8)
const mondayWeek3 = new Date(2024, 0, 15)
const mondayWeek4 = new Date(2024, 0, 22)

describe("getWeekOfYear", () => {
  it("counts the first week from January 1st", () => {
    expect(getWeekOfYear(mondayWeek1)).toBe(1)
  })

  it("advances one week every seven days", () => {
    expect(getWeekOfYear(mondayWeek2)).toBe(2)
    expect(getWeekOfYear(mondayWeek3)).toBe(3)
  })
})

describe("getShiftForTeam", () => {
  it("applies the week-1 rotation for G1, G2 and G3", () => {
    expect(getShiftForTeam(mondayWeek1, "G1")).toEqual({
      team: "G1",
      shift: "DIURNO",
      startTime: "06:00",
      endTime: "18:00",
    })
    expect(getShiftForTeam(mondayWeek1, "G2")).toEqual({
      team: "G2",
      shift: "NOCTURNO",
      startTime: "18:00",
      endTime: "06:00",
    })
    expect(getShiftForTeam(mondayWeek1, "G3")).toEqual({
      team: "G3",
      shift: "LIBRE",
      startTime: "",
      endTime: "",
    })
  })

  it("rotates every three weeks and starts over", () => {
    expect(getShiftForTeam(mondayWeek2, "G1").shift).toBe("LIBRE")
    expect(getShiftForTeam(mondayWeek2, "G2").shift).toBe("DIURNO")
    expect(getShiftForTeam(mondayWeek3, "G1").shift).toBe("NOCTURNO")
    expect(getShiftForTeam(mondayWeek4, "G1").shift).toBe("DIURNO")
  })

  it("uses the fixed day schedule for TN", () => {
    expect(getShiftForTeam(mondayWeek1, "TN")).toEqual({
      team: "TN",
      shift: "DIURNO",
      startTime: "07:00",
      endTime: "16:00",
    })
  })

  it("gives TN a rest day on Saturday and Sunday", () => {
    const saturday = new Date(2024, 0, 6)
    const sunday = new Date(2024, 0, 7)
    expect(getShiftForTeam(saturday, "TN").shift).toBe("DESCANSO")
    expect(getShiftForTeam(sunday, "TN").shift).toBe("DESCANSO")
  })

  it("gives G2 a half shift on Saturday of week 1", () => {
    const saturday = new Date(2024, 0, 6)
    expect(getShiftForTeam(saturday, "G2")).toEqual({
      team: "G2",
      shift: "MEDIA_JORNADA",
      startTime: "06:00",
      endTime: "13:00",
    })
  })
})

describe("getDaySchedule", () => {
  it("returns the four teams with the Spanish day name", () => {
    const schedule = getDaySchedule(mondayWeek1)
    expect(schedule.dayOfWeek).toBe("Lunes")
    expect(schedule.schedules.map((entry) => entry.team)).toEqual([
      "G1",
      "G2",
      "G3",
      "TN",
    ])
  })
})

describe("getDayNameSpanish", () => {
  it("translates every day of the week", () => {
    expect(getDayNameSpanish("monday")).toBe("Lunes")
    expect(getDayNameSpanish("tuesday")).toBe("Martes")
    expect(getDayNameSpanish("wednesday")).toBe("Miércoles")
    expect(getDayNameSpanish("thursday")).toBe("Jueves")
    expect(getDayNameSpanish("friday")).toBe("Viernes")
    expect(getDayNameSpanish("saturday")).toBe("Sábado")
    expect(getDayNameSpanish("sunday")).toBe("Domingo")
  })
})

describe("getShiftLabelSpanish", () => {
  it("translates every shift", () => {
    expect(getShiftLabelSpanish("DIURNO")).toBe("Diurno")
    expect(getShiftLabelSpanish("NOCTURNO")).toBe("Nocturno")
    expect(getShiftLabelSpanish("MEDIA_JORNADA")).toBe("Media Jornada")
    expect(getShiftLabelSpanish("LIBRE")).toBe("Libre")
    expect(getShiftLabelSpanish("DESCANSO")).toBe("Descanso")
  })
})

describe("getCurrentWeekSchedule", () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it("returns seven days starting on the Monday of the current week", () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2024, 0, 3, 12, 0, 0))

    const week = getCurrentWeekSchedule()

    expect(week).toHaveLength(7)
    expect(week[0].date.toDateString()).toBe(new Date(2024, 0, 1).toDateString())
    expect(week[6].date.toDateString()).toBe(new Date(2024, 0, 7).toDateString())
  })
})
