import { View, Image, ScrollView, Pressable, TextInput } from 'react-native';
import Header, { HeaderIcon } from '@/components/Header';
import ThemedScroller from '@/components/ThemeScroller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useThemeColors from '../contexts/ThemeColors';
import { shadowPresets } from '@/utils/useShadow';
import React, { useState } from 'react';
import Icon from '@/components/Icon';
import ThemedText from '@/components/ThemedText';
import ThemedFooter from '@/components/ThemeFooter';
import { Button } from '@/components/Button';
import { Link, router } from 'expo-router';
import { CardScroller } from '@/components/CardScroller';
import { Chip } from '@/components/Chip';

const workoutSections = [
    {
        title: 'Strength Training',
        workouts: [
            { title: 'Upper Body Strength', duration: '45 min', exercises: 8 },
            { title: 'Lower Body Power', duration: '50 min', exercises: 10 },
            { title: 'Full Body Circuit', duration: '40 min', exercises: 12 },
            { title: 'Core & Abs Blast', duration: '25 min', exercises: 6 },
            { title: 'Push Pull Legs', duration: '60 min', exercises: 9 },
        ]
    },
    {
        title: 'Cardio',
        workouts: [
            { title: 'HIIT Cardio Burn', duration: '30 min', exercises: 8 },
            { title: 'Running Intervals', duration: '35 min', exercises: 5 },
            { title: 'Cycling Endurance', duration: '45 min', exercises: 4 },
            { title: 'Jump Rope Circuit', duration: '20 min', exercises: 6 },
        ]
    },
    {
        title: 'Yoga',
        workouts: [
            { title: 'Morning Yoga Flow', duration: '30 min', exercises: 12 },
            { title: 'Power Yoga', duration: '45 min', exercises: 15 },
            { title: 'Restorative Yoga', duration: '60 min', exercises: 8 },
            { title: 'Yoga for Flexibility', duration: '25 min', exercises: 10 },
        ]
    },
    {
        title: 'Pilates',
        workouts: [
            { title: 'Pilates Core', duration: '35 min', exercises: 9 },
            { title: 'Full Body Pilates', duration: '50 min', exercises: 12 },
        ]
    },
    {
        title: 'Functional',
        workouts: [
            { title: 'Functional Movement', duration: '40 min', exercises: 8 },
            { title: 'Athletic Performance', duration: '55 min', exercises: 10 },
        ]
    }
];

export default function AddWorkoutScreen() {
    return (
        <>
            <SearchInput />
            <ThemedScroller className='!px-4 pt-6'>
                <View className='gap-6'>
                    {workoutSections.map((section, sectionIndex) => (
                        <View key={sectionIndex}>
                            <ThemedText className='text-xl font-bold mb-3'>
                                {section.title}
                            </ThemedText>
                            <View className='gap-3'>
                                {section.workouts.map((workout, workoutIndex) => (
                                    <WorkoutCard
                                        key={`${sectionIndex}-${workoutIndex}`}
                                        title={workout.title}
                                        duration={workout.duration}
                                        exercises={workout.exercises}
                                    />
                                ))}
                            </View>
                        </View>
                    ))}
                </View>
            </ThemedScroller>
            <ThemedFooter>
                <Button title='Add Workout' className="!bg-highlight" textClassName='!text-white' onPress={() => { }} />
            </ThemedFooter>
        </>
    );
}

const SearchInput = () => {
    const insets = useSafeAreaInsets();
    const colors = useThemeColors();
    return (
        <View style={{ paddingTop: insets.top }} className='flex-col px-4 pb-4 items-center bg-secondary justify-between'>
            <View className='relative h-14 flex-row  bg-border rounded-xl'>
                <Icon name='ArrowLeft' onPress={() => router.back()} size={20} className='pl-2' />
                <TextInput className='flex-1 h-14 text-text rounded-xl px-4 ' placeholder='Search workouts' placeholderTextColor={colors.placeholder} />
            </View>
            <CardScroller className='mt-4'>
                <Chip className='!bg-background' size="lg" label='Strength' />
                <Chip className='!bg-background' size="lg" label='Cardio' />
                <Chip className='!bg-background' size="lg" label='Yoga' />
                <Chip className='!bg-background' size="lg" label='Pilates' />
                <Chip className='!bg-background' size="lg" label='Functional' />
            </CardScroller>
        </View>
    )
}

const WorkoutCard = (props: any) => {

    return (
        <Link asChild href="/screens/workout-tracker">
            <Pressable
                style={{ ...shadowPresets.card }}
                className="bg-secondary flex-row items-center justify-between rounded-xl p-4"
            >
                <View className="flex-1">
                    <ThemedText className="text-lg font-semibold mb-2">
                        {props.title}
                    </ThemedText>

                    <View className="flex-row items-center gap-4">
                        <View className="flex-row items-center">
                            <Icon name="Clock" size={14} className="mr-1 opacity-60" />
                            <ThemedText className="text-sm opacity-60">
                                {props.duration}
                            </ThemedText>
                        </View>

                        <View className="flex-row items-center">
                            <ThemedText className="text-sm opacity-60">
                                {props.exercises} exercises
                            </ThemedText>
                        </View>
                    </View>
                </View>

                <Icon name='Play' size={20} className='w-10 h-10 bg-background rounded-full' />
            </Pressable>
        </Link>
    );
}


