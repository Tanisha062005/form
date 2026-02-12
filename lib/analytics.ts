interface Field {
    id: string;
    label: string;
    type: string;
    options?: string[];
}

interface Submission {
    answers: Record<string, unknown>;
}

export const processSubmissions = (fields: Field[], submissions: Submission[]) => {
    const chartableFields = fields.filter((f) =>
        ['radio', 'select', 'checkbox'].includes(f.type)
    );

    const stats = chartableFields.map((field) => {
        const options = field.options || [];
        const data = options.map((option: string) => {
            const count = submissions.reduce((acc, sub) => {
                const answer = sub.answers[field.id];
                if (Array.isArray(answer)) {
                    return acc + (answer.includes(option) ? 1 : 0);
                }
                return acc + (answer === option ? 1 : 0);
            }, 0);
            return { name: option, value: count };
        });

        // Calculate total for percentage
        const total = data.reduce((sum: number, item: { value: number }) => sum + item.value, 0);

        // Find most selected option
        const sortedData = [...data].sort((a, b) => b.value - a.value);
        const topOption = sortedData[0] || { name: 'N/A', value: 0 };
        const percentage = total > 0 ? Math.round((topOption.value / total) * 100) : 0;

        return {
            fieldId: field.id,
            label: field.label,
            type: field.type,
            data,
            total,
            summary: {
                topOption: topOption.name,
                percentage
            }
        };
    });

    return stats;
};
