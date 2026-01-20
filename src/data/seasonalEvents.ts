export interface SeasonalEvent {
    id: string;
    name: string;
    emoji: string;
    description: string;
    startMonth: number; // 1-12
    startDay: number;
    endMonth: number;
    endDay: number;
    theme: string;
    colors: { primary: string; secondary: string; accent: string };
    rewards: { skin?: string; coins: number; title?: string };
    challenges: { id: string; name: string; target: number; reward: number }[];
}

export const SEASONAL_EVENTS: SeasonalEvent[] = [
    {
        id: 'diwali',
        name: 'Diwali Festival',
        emoji: '🪔',
        description: 'Festival of Lights! Collect diyas and spread joy.',
        startMonth: 10, startDay: 20, endMonth: 11, endDay: 5,
        theme: 'diwali',
        colors: { primary: '#f97316', secondary: '#eab308', accent: '#ef4444' },
        rewards: { skin: 'diwali_snake', coins: 500, title: 'Diwali Champion' },
        challenges: [
            { id: 'd1', name: 'Collect 50 Diyas', target: 50, reward: 100 },
            { id: 'd2', name: 'Light 100 Lamps', target: 100, reward: 200 },
            { id: 'd3', name: 'Score 5000 Points', target: 5000, reward: 300 },
        ]
    },
    {
        id: 'christmas',
        name: 'Christmas Wonderland',
        emoji: '🎄',
        description: 'Spread holiday cheer! Collect presents and candy canes.',
        startMonth: 12, startDay: 15, endMonth: 12, endDay: 31,
        theme: 'christmas',
        colors: { primary: '#22c55e', secondary: '#ef4444', accent: '#fbbf24' },
        rewards: { skin: 'santa_snake', coins: 500, title: 'Santa Snake' },
        challenges: [
            { id: 'c1', name: 'Collect 50 Presents', target: 50, reward: 100 },
            { id: 'c2', name: 'Eat 100 Candy Canes', target: 100, reward: 200 },
            { id: 'c3', name: 'Build 25 Snowmen', target: 25, reward: 300 },
        ]
    },
    {
        id: 'valentine',
        name: "Valentine's Day",
        emoji: '❤️',
        description: 'Share the love! Collect hearts and spread romance.',
        startMonth: 2, startDay: 7, endMonth: 2, endDay: 21,
        theme: 'valentine',
        colors: { primary: '#ec4899', secondary: '#f472b6', accent: '#ef4444' },
        rewards: { skin: 'love_snake', coins: 400, title: 'Love Champion' },
        challenges: [
            { id: 'v1', name: 'Collect 100 Hearts', target: 100, reward: 100 },
            { id: 'v2', name: 'Score 3000 Points', target: 3000, reward: 200 },
            { id: 'v3', name: 'Play 10 Games', target: 10, reward: 150 },
        ]
    },
    {
        id: 'chhath',
        name: 'Chhath Puja',
        emoji: '☀️',
        description: 'Worship the Sun God! Collect offerings and blessings.',
        startMonth: 11, startDay: 5, endMonth: 11, endDay: 12,
        theme: 'chhath',
        colors: { primary: '#fbbf24', secondary: '#f97316', accent: '#0ea5e9' },
        rewards: { skin: 'sun_snake', coins: 400, title: 'Sun Worshipper' },
        challenges: [
            { id: 'ch1', name: 'Collect 50 Offerings', target: 50, reward: 100 },
            { id: 'ch2', name: 'Watch 10 Sunrises', target: 10, reward: 200 },
            { id: 'ch3', name: 'Complete River Ritual', target: 5, reward: 250 },
        ]
    },
    {
        id: 'dussehra',
        name: 'Dussehra Victory',
        emoji: '🏹',
        description: 'Victory of good over evil! Defeat Ravana and earn glory.',
        startMonth: 10, startDay: 1, endMonth: 10, endDay: 15,
        theme: 'dussehra',
        colors: { primary: '#ef4444', secondary: '#fbbf24', accent: '#22c55e' },
        rewards: { skin: 'warrior_snake', coins: 500, title: 'Ravana Slayer' },
        challenges: [
            { id: 'ds1', name: 'Score 10000 Points', target: 10000, reward: 200 },
            { id: 'ds2', name: 'Defeat 50 Enemies', target: 50, reward: 300 },
            { id: 'ds3', name: 'Burn 10 Effigies', target: 10, reward: 400 },
        ]
    },
    {
        id: 'eid',
        name: 'Eid Celebration',
        emoji: '☪️',
        description: 'Eid Mubarak! Celebrate with feasts and joy.',
        startMonth: 4, startDay: 1, endMonth: 4, endDay: 15,
        theme: 'eid',
        colors: { primary: '#22c55e', secondary: '#fbbf24', accent: '#3b82f6' },
        rewards: { skin: 'moon_snake', coins: 450, title: 'Eid Champion' },
        challenges: [
            { id: 'e1', name: 'Collect 75 Crescents', target: 75, reward: 150 },
            { id: 'e2', name: 'Share 20 Gifts', target: 20, reward: 200 },
            { id: 'e3', name: 'Score 4000 Points', target: 4000, reward: 250 },
        ]
    }
];

export const isEventActive = (event: SeasonalEvent): boolean => {
    const now = new Date();
    const month = now.getMonth() + 1;
    const day = now.getDate();

    if (event.startMonth === event.endMonth) {
        return month === event.startMonth && day >= event.startDay && day <= event.endDay;
    } else if (event.startMonth < event.endMonth) {
        return (month === event.startMonth && day >= event.startDay) ||
            (month === event.endMonth && day <= event.endDay) ||
            (month > event.startMonth && month < event.endMonth);
    } else {
        return (month === event.startMonth && day >= event.startDay) ||
            (month === event.endMonth && day <= event.endDay) ||
            month > event.startMonth || month < event.endMonth;
    }
};

export const getEffectiveActiveEventId = (settings: any): string | null => {
    for (const event of SEASONAL_EVENTS) {
        // 1. Check direct override (Active/Blocked)
        const override = settings?.eventOverrides?.[event.id];
        if (override === true) return event.id;
        if (override === false) continue;

        // 2. Check custom date range
        const customDates = settings?.eventDates?.[event.id];
        if (customDates?.startDate && customDates?.endDate) {
            const now = new Date();
            const start = new Date(customDates.startDate);
            const end = new Date(customDates.endDate);
            if (now >= start && now <= end) return event.id;
            continue;
        }

        // 3. Fallback to default logic
        if (isEventActive(event)) return event.id;
    }
    return null;
};
