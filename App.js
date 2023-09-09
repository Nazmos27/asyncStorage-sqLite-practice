import { StatusBar } from 'expo-status-bar';
import { Button, StyleSheet, Text, TextInput, View } from 'react-native';
import * as SQLite from 'expo-sqlite';
import { useEffect, useState } from 'react';

export default function App() {

  const db = SQLite.openDatabase('example.db')
  const [isLoading, setIsLoading] = useState(true)
  const [data, setData] = useState([])
  const [currentName, setCurrentName] = useState(undefined)

  useEffect(() => {
    db.transaction(tx => {
      tx.executeSql('create table if not exists names (id INTEGER PRIMARY KEY AUTOINCREMENT,name TEXT)')
    })

    db.transaction(tx => {
      tx.executeSql('select * from names', null,
        (txObj, resultSet) => setData(resultSet.rows._array),
        (txObj, err) => console.log(err)
      )
    })

    setIsLoading(false)
  }, [])



  const addName = () => {
    db.transaction(tx => {
      tx.executeSql('insert into names (name) values (?)', [currentName],
        (texObj, resultSet) => {
          let existingNames = [...data]
          existingNames.push({ id: resultSet.insertId, name: currentName })
          setData(existingNames)
          setCurrentName(undefined)
        },
        (txObject, error) => console.log("Error", error)
      )
    })
  }

  const deleteName = (id) => {
    db.transaction(tx => {
      tx.executeSql('delete from names where id = (?)', [id],
        (txObj, resultSet) => {
          if (resultSet.rowsAffected > 0) {
            let existingNames = [...data].filter(name => name.id !== id)
            setData(existingNames)
          }
        },
        (txObj, error) => console.log(error)
      )
    })
  }

  const updateName = (id) => {
    db.transaction(tx => {
      tx.executeSql('update names set name = ? where id = ?', [currentName, id],
        (txObj, resultSet) => {
          if (resultSet.rowsAffected > 0) {
            let existingNames = [...data]
            const indexToUpdate = existingNames.findIndex(name => name.id === id)
            existingNames[indexToUpdate].name = currentName
            setData(existingNames)
            setCurrentName(undefined)
          }
        },
        (txObj, error) => console.log(error)
      )
    })
  }

  const showNames = () => {
    return data.map((name, index) => {
      return (<View style={styles.rows} key={index}>
        <Text>
          {name.name}
        </Text>
        <Button title='Delete' onPress={() => deleteName(name.id)}></Button>
        <Button title='Update' onPress={() => updateName(name.id)}></Button>
      </View>)
    })
  }


  if (isLoading) {
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
  textBox: {
    height: 50,
    width: '80%',
    borderWidth: 2,
    borderColor: "grey",
    padding: 10
  },
  rows:{
    display:'flex',
    flexDirection:'row',
    justifyContent:'space-between',
    alignItems:'center',
    gap:60,
    borderWidth:4,
    borderColor:"grey",
    marginVertical:5,
    padding:10,
  
  }
});
