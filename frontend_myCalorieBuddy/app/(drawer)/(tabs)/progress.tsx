import React, { useState } from 'react';
import { View, Pressable, Dimensions, Image } from 'react-native';
import ThemedText from 'components/ThemedText';
import ThemedScroller from 'components/ThemeScroller';
import Icon from 'components/Icon';
import Header from 'components/Header';
import { Link } from 'expo-router';
import Section from '@/components/layout/Section';
import { LineChart } from 'react-native-chart-kit';
import useThemeColors from '@/app/contexts/ThemeColors';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';
import { useFocusEffect } from '@react-navigation/native';
import Avatar from '@/components/Avatar';

const { width } = Dimensions.get('window');

export default function ProgressScreen() {
  return (
    <>
      <Header
        className='bg-secondary'
        leftComponent={<Avatar src={require('@/assets/img/user-3.jpg')} size="sm" link="/screens/profile" />}
        rightComponents={[<Icon name="PlusCircle" size={24} href="/screens/weight-entry" className="text-light-text dark:text-dark-text" />]}
      />
      <ThemedScroller className="flex-1 !px-0">
        <View className='px-global bg-secondary '>
          <Section title="Weight progress" subtitle='Past 30 days' titleSize='3xl' className=' mt-10 mb-2'></Section>
          <WeightLossChart />
        </View>
        <View className='px-global mt-4'>
          <ThemedText className='text-lg font-semibold'>Entries</ThemedText>
          <ProgressCard day='Wednesday, 18 June' weight='75.2' photo={require('@/assets/img/progress.png')} />
          <ProgressCard day='Tuesday, 17 June' weight='75.2' photo={require('@/assets/img/progress-2.png')} />
          <ProgressCard day='Monday, 16 June' weight='75.2' photo={require('@/assets/img/progress-2.png')} />
          <ProgressCard day='Sunday, 15 June' weight='75.2' photo={require('@/assets/img/progress-2.png')} />
          <ProgressCard day='Saturday, 14 June' weight='75.2' />
          <ProgressCard day='Friday, 13 June' weight='75.2' />
          <ProgressCard day='Thursday, 12 June' weight='75.2' />
          <ProgressCard day='Wednesday, 11 June' weight='75.2' />
        </View>
      </ThemedScroller>
    </>
  )
}

interface WeightLossChartProps {
  className?: string;
}

const WeightLossChart: React.FC<WeightLossChartProps> = ({
  className = ''
}) => {
  const colors = useThemeColors();
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0, visible: false, value: 0 });

  const animatedWidth = useSharedValue(0);

  useFocusEffect(
    React.useCallback(() => {
      animatedWidth.value = 0;
      animatedWidth.value = withTiming(width, { duration: 2000, easing: Easing.bezier(0.25, 0.1, 0.25, 1.0) });
    }, [])
  );

  const animatedStyle = useAnimatedStyle(() => ({
    width: animatedWidth.value,
  }));

  // Mock weight data for past month (30 days) - more realistic with daily fluctuations
  const weightData = [
    75.2, 75.2, 75.2, 75.0, 74.9, 74.9, 74.9, 74.8, 74.7, 74.7,
    74.8, 74.8, 74.8, 74.7, 74.6, 74.5, 74.4, 74.3, 74.2, 74.1,
    74.1, 73.9, 73.9, 73.9, 73.8, 73.8, 73.8, 73.7, 73.7, 73.6,
  ];

  // Calculate statistics
  const currentWeight = weightData[weightData.length - 1];
  const startingWeight = weightData[0];
  const weightLost = startingWeight - currentWeight;

  const chartData = {
    labels: ['1', '', '', '', '', '5', '', '', '', '', '10', '', '', '', '', '15', '', '', '', '', '20', '', '', '', '', '25', '', '', '', '', '30'],
    datasets: [
      {
        data: weightData,
        color: () => colors.highlight,
        strokeWidth: 3,
      }
    ]
  };

  const chartConfig = {
    backgroundColor: 'transparent',
    backgroundGradientFrom: 'transparent',
    backgroundGradientTo: 'transparent',
    backgroundGradientFromOpacity: 0,
    backgroundGradientToOpacity: 0,
    decimalPlaces: 1,
    color: () => colors.highlight,
    labelColor: () => colors.text,
    style: {
      borderRadius: 0,
    },
    fillShadowGradient: colors.highlight,
    fillShadowGradientOpacity: 1,
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      fill: "transparent",
      stroke: "transparent",
    },
    propsForBackgroundLines: {
      strokeWidth: 1,
      stroke: colors.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
      strokeDasharray: '',
    },
    propsForVerticalLines: {
      strokeWidth: 0,
      stroke: 'transparent',
    },
    propsForHorizontalLines: {
      strokeWidth: 1,
      stroke: colors.isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.4)',
    },
    formatYLabel: (yValue: string) => `${yValue}kg`,
    withHorizontalLabels: true,
    withVerticalLabels: true,
  };

  return (
    <View className={className}>
      {/* Header Stats */}
      <View className="mb-6">

        <View className="flex-row justify-between mb-2 pt-6 mt-6 border-t border-border">
          <View>
            <ThemedText className="text-sm opacity-60 mb-1">Current Weight</ThemedText>
            <View className="flex-row items-end">
              <ThemedText className="text-4xl font-bold">{currentWeight}</ThemedText>
              <ThemedText className="text-lg opacity-60 ml-1 mb-1">kg</ThemedText>
            </View>
          </View>
          <View>
            <ThemedText className="text-sm opacity-60 mb-1">Weight Lost</ThemedText>
            <View className="flex-row items-end">
              <Icon className='-translate-y-px' name="ArrowDownLeft" size={20} color={colors.highlight} />
              <ThemedText className="text-4xl font-bold text-green-600">{weightLost.toFixed(1)}</ThemedText>
              <ThemedText className="text-lg opacity-60 ml-1 mb-1">kg</ThemedText>
            </View>
          </View>
        </View>

      </View>

      {/* Chart */}
      <View className="-ml-4">
        <Animated.View className="overflow-hidden"
          style={animatedStyle}
        >
          <LineChart
            data={chartData}
            width={width - 30}
            height={300}
            chartConfig={chartConfig}
            withDots={true}
            withShadow={false}
            withInnerLines={true}
            withOuterLines={true}
            withHorizontalLabels={true}
            withVerticalLabels={true}
            withVerticalLines={false}
            bezier
            onDataPointClick={(data) => {
              setTooltipPos({
                x: data.x,
                y: data.y,
                visible: true,
                value: data.value
              });
              // Hide tooltip after 2 seconds
              setTimeout(() => {
                setTooltipPos(prev => ({ ...prev, visible: false }));
              }, 2000);
            }}
            decorator={() => {
              return tooltipPos.visible ? (
                <View
                  style={{
                    position: 'absolute',
                    left: tooltipPos.x - 25,
                    top: tooltipPos.y - 50,
                    backgroundColor: colors.isDark ? '#1f1f1f' : '#ffffff',
                    padding: 10,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: colors.isDark ? '#404040' : '#e0e0e0',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.25,
                    shadowRadius: 4,
                    elevation: 5,
                    zIndex: 1000,
                  }}
                >
                  <ThemedText className="text-sm font-bold">
                    {tooltipPos.value}kg
                  </ThemedText>
                </View>
              ) : null;
            }}
            style={{
              borderRadius: 0,
              backgroundColor: 'transparent',
              marginLeft: -10,
            }}
          />
        </Animated.View>
      </View>
    </View>
  );
};

const ProgressCard = (props: any) => {
  return (
    <Link asChild href="/screens/weight-entry">
      <Pressable className="bg-secondary flex-row items-center rounded-lg p-4 mt-4 justify-between">
        <View>
          <ThemedText className='text-base'>{props.day}</ThemedText>
          <ThemedText className='opacity-60'>{props.weight}kg</ThemedText>
        </View>
        {props.photo ?
          <Image source={props.photo} className="w-12 h-12 rounded-lg bg-background" style={{ resizeMode: 'cover' }} />
          :
          <View className='w-12 h-12 rounded-lg bg-background items-center justify-center'>
            <Icon name="Image" size={16} className="opacity-50" />
          </View>
        }
      </Pressable>
    </Link>
  )
}