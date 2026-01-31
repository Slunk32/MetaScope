import { Link } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

export type EventCardProps = {
    id: string;
    name: string;
    format: string;
    date: string;
    type: string; // 'Challenge', 'League', 'Showcase'
};

// Solid colors for the "Left Bar" indicator
const FORMAT_COLORS: Record<string, string> = {
    Modern: '#3B82F6',    // Blue
    Pioneer: '#E11D48',   // Pink
    Legacy: '#D97706',    // Amber/Gold
    Vintage: '#9333EA',   // Purple
    Pauper: '#16A34A',    // Green
    Standard: '#DC2626',  // Red
    Default: '#71717A',   // Zinc
};

export function EventCard({ id, name, format, date, type }: EventCardProps) {
    const barColor = FORMAT_COLORS[format] || FORMAT_COLORS['Default'];

    return (
        <Link href={`/event/${id}`} asChild>
            <Pressable className="mx-4 my-2 active:opacity-90 active:scale-98 transition-all">
                {/* Main Card Pill */}
                <View
                    className="flex-row overflow-hidden bg-[#1C1C1E] h-24 shadow-sm"
                    style={{ borderRadius: 20 }} // "Big pill" shape
                >
                    {/* Left Color Indicator Bar */}
                    <View
                        className="w-3 h-full mb-2 ml-1"
                        style={{
                            backgroundColor: barColor,
                            marginTop: 12,        // Top vertical spacing
                            marginBottom: 12,     // Bottom vertical spacing
                            borderRadius: 10,     // Fully rounded ends for the bar itself
                        }}
                    />

                    {/* Content Container */}
                    <View className="flex-1 flex-row items-center justify-between px-4 py-3">

                        {/* Left Info: Format & Type */}
                        <View className="justify-center gap-1">
                            <Text className="text-2xl font-bold text-white tracking-tight">
                                {format}
                            </Text>
                            <Text className="text-sm font-medium text-zinc-400 uppercase tracking-wider">
                                {type}
                            </Text>
                        </View>

                        {/* Right Info: Date & Count (Simulated) */}
                        <View className="items-end justify-center gap-1">
                            {/* Mimicking the "Value" look from screenshot */}
                            <Text className="text-lg font-bold text-white tabular-nums">
                                {date.split('-').slice(1).join('/')} {/* Show MM/DD */}
                            </Text>
                            <Text className="text-xs font-semibold text-[#4ade80]">
                                Final
                            </Text>
                        </View>
                    </View>
                </View>
            </Pressable>
        </Link>
    );
}
