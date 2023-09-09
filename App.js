import { StatusBar } from 'expo-status-bar';
import { Button, StyleSheet, Text, TextInput, View } from 'react-native';
import * as SQLite from 'expo-sqlite';
import { useEffect, useState } from 'react';

export default function App() {

  const db = SQLite.openDatabase('example.db')
  const [isLoading,setIsLoading] = useState(true)
  const [data,setData] = useState([])
  const [currentName,setCurrentName] = useState(undefined)

  useEffect(()=>{
    db.transaction(tx=>{
      tx.executeSql('create table if not exists names (id INTEGER PRIMARY KEY AUTOINCREMENT,name TEXT)')
    })

    db.transaction(tx=>{
      tx.executeSql('select * from names',null,
      (txObj,resultSet) => setData(resultSet.rows._array),
      (txObj,err) => console.log(err)
      )
    })

    setIsLoading(false)
  },[])

  const showNames = () => {
    return data.map((name,index) => {
      return (<View key={index}>
        <Text>
          {name.name}
        </Text>
      </View>)
    })
  }

  const addName = () => {
    db.transaction(tx=>{
      tx.executeSql('insert into names (name) values (?)',[currentName],
      (texObj,resultSet)=>{
        let existingNames = [...data]
        existingNames.push({id: resultSet.insertId, name: currentName})
        setData(existingNames)
        setCurrentName(undefined)
      },
      (txObject,error)=>console.log("Error", error)
      )
    })
  }
  

  if(isLoading){
    return (
      <View style={styles.container}>
        <Text>Loading names...</Text>
      </View>
    )
  }



  return (
    <View style={styles.container}>
      <TextInput value={currentName} placeholder='Name' onChangeText={setCurrentName} style={styles.textBox}></TextInput>
      <Button title='Add Name' onPress={addName}></Button>
      {showNames()}
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBox:{
    height:50,
    width:'80%',
    borderWidth: 2,
    borderColor : "grey",
    padding:10
  }
});
