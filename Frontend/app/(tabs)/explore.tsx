import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps'

type Props = {}

const ExploreScreen = (props: Props) => {
  return (
    <View style={{ flex: 1 }}>
			<MapView style={StyleSheet.absoluteFill} />
		</View>
  )
}

export default ExploreScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
})