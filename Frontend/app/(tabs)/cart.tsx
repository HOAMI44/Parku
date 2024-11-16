import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import CardMap from '@/components/CardMap'

type Props = {}

const CartScreen = (props: Props) => {
  return (
    <View style={styles.container}>
      <CardMap
       id={1}
       name="Hotel"
       time="5:00"
       type="Hotel"
       width={100}
       length={100}
       rating={5}
       price={100}
       />
    </View>
  )
}

export default CartScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
})