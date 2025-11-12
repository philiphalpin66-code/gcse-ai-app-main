import { TOPICS } from '../constants';

let topicToSubjectMap: Map<string, string> | null = null;

const generateTopicMap = (): Map<string, string> => {
    const map = new Map<string, string>();
    
    (Object.keys(TOPICS) as Array<keyof typeof TOPICS>).forEach(board => {
        const subjects = TOPICS[board];
        (Object.keys(subjects) as Array<keyof typeof subjects>).forEach(subject => {
            const papers = subjects[subject];
            (Object.keys(papers) as Array<keyof typeof papers>).forEach(paper => {
                const topicList = papers[paper];
                topicList.forEach(topic => {
                    if (!map.has(topic)) {
                        map.set(topic, subject as string);
                    }
                });
            });
        });
    });
    return map;
};

export const getSubjectForTopic = (topic: string): string | null => {
    if (!topicToSubjectMap) {
        topicToSubjectMap = generateTopicMap();
    }
    return topicToSubjectMap.get(topic) || null;
};
