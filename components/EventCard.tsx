import { Link } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

export type EventCardProps = {
    id: string;
    name: string;
    format: string;
    date: string;
    type: string; // 'Challenge', 'League', 'Showcase'
};

export function EventCard({ id, name, format, date, type }: EventCardProps) {
    return (
        <Link href={`/event/${id}`} asChild>
            <Pressable className="mx-4 my-2 overflow-hidden rounded-xl bg-white p-4 shadow-sm active:bg-gray-50 dark:bg-zinc-900 dark:active:bg-zinc-800">
                <View className="flex-row items-center justify-between">
                    <View>
                        <Text className="mb-1 text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                            {format} • {type}
                        </Text>
                        <Text className="text-lg font-semibold text-black dark:text-white" numberOfLines={1}>
                            {name}
                        </Text>
                        <Text className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            {date}
                        </Text>
                    </View>
                    <View className="h-8 w-8 items-center justify-center rounded-full bg-gray-100 dark:bg-zinc-800">
                        <Text className="text-gray-400 dark:text-gray-500">›</Text>
                    </View>
                </View>
            </Pressable>
        </Link>
    );
}
