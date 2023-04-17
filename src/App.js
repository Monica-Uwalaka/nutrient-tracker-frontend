import './App.css';
import {Button, Form, Modal, Navbar, Container} from 'react-bootstrap';
import React, { useState, useEffect, useRef } from 'react';
import { Typeahead } from 'react-bootstrap-typeahead';
import foundationFoodsDict from './food_dict.json'

/**
 * Food search bar to search up Foods
 * Based on code from ericgio, https://ericgio.github.io/react-bootstrap-typeahead/#basic-example
 */

function App() {
  const [singleSelections, setSingleSelections] = useState([]);
  const [calculateButtonPressed, setCalculateButtonPressed] = useState(false);
  const [show, setShow] = useState(false);
  const [amount, setAmount] = useState(0);

  let foodSelected = useRef("")
  let foodId = useRef("");
  let foodNutrients = useRef({});
  let result = useRef({})

  const handleModalClose = () => setShow(false);
  const handleModalShow = () => setShow(true);

  const getNutrients = () =>{
    let resultDivs = []
    for(const i in result.current){
      resultDivs.push(<p>{`${i}, ${result.current[i]}`}</p>)
    }
    return(
      <>
        {resultDivs}
      </>
    )
  }

  const onClickCalculateButton = (e) =>{
    setCalculateButtonPressed(true)
    e.preventDefault()
  }

  const validNutrients = (aNutrient) => {
      const validNutrientsDict = {"Protein":"protein", "Carbohydrate, by difference": "carbs", "Total lipid (fat)": "fats", "Total fat (NLEA)": "fats"};
      return aNutrient.nutrient.name in validNutrientsDict;
  }

  const calculateNutrientAmount = () => {
    for(let i = 0; i<foodNutrients.current.length; i++){
      result.current[foodNutrients.current[i].nutrient.name] = foodNutrients.current[i].amount * (amount/100)      
    }
  }

  //useEffect to get fcid
  useEffect(() =>{
    if (singleSelections.length !== 0){
      foodId.current = singleSelections[0].fdc_id
    }
    else{
    }
  }, [singleSelections])
  
  useEffect(() =>{
    if(calculateButtonPressed){
      fetch(`https://api.nal.usda.gov/fdc/v1/food/${foodId.current}?api_key=${process.env.REACT_APP_API_KEY}`)
      .then((response) => response.json())
      .then((data) => {
        foodSelected.current = data.description;
        foodNutrients.current = data["foodNutrients"].filter(validNutrients)
        calculateNutrientAmount()
        handleModalShow()
        setCalculateButtonPressed(false)
      })
      .catch((err) => {
        console.log(err.message)
      })
    }
  }, [calculateButtonPressed, ])

  return (
    <div className="App">
      <Container id="navbar-container">
        <Navbar>
          <Navbar.Brand href="/">Nutrient-Tracker</Navbar.Brand>
        </Navbar>
      </Container>
     
      <Container id='search-food-form-container'>
        <Form id="search-form" className="m-3">
          <Form.Group>
            <Form.Label>Food Name</Form.Label>
            <Typeahead
              id="basic-typeahead-single"
              labelKey="description"
              onChange={setSingleSelections}
              options={foundationFoodsDict}
              placeholder="Enter a food"
              selected={singleSelections}
            />
            <Form.Label>Amount(in grams)</Form.Label>
            <Form.Control type="number" value={amount} onChange={(e) => setAmount(e.target.value)}/>
          </Form.Group>
          <Button className="m-3 calculate-button" onClick={onClickCalculateButton} variant="primary" type="submit"> Calculate </Button>
        </Form>
      </Container>
      
      <Modal size="lg" aria-labelledby="contained-modal-title-vcenter" centered show={show} onHide={handleModalClose}>
        <Modal.Header closeButton>
          <Modal.Title>{amount} grams of {foodSelected.current}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {getNutrients()}
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default App;
