import React from 'react';
import { connect } from 'dva';
import { Button, Modal, Input, Form } from 'antd';
import styleObj from './IndexPage.scss';
import contacts from '../data/contactsData'


class IndexPage extends React.Component {

  constructor(props){
    super(props);
    this.state = {
      // Firstname or Lastname
      isFirstnameOrder: true,
      // add or update:different button
      modalType: 'add',
      // contactsData
      contacts: contacts,
      // visibility of Modal
      visible: false,
      // Layout of ModalForm
      formItemLayout: {
        labelCol: {
          xs: { span: 24 },
          sm: { span: 6 },
        },
        wrapperCol: {
          xs: { span: 24 },
          sm: { span: 18 },
        },
      },
      // SelectedContact
      selectedContact: {
        "firstName": "",
        "lastName": "",
        "numbers": []
      }
    }
  }

  // Order by Firstname
  getGroupByFirstname () {
    var newObj = {};
    var { contacts } = this.state;
    for(var i = 0; i < contacts.length; i++){
      var tempObj = contacts[i];
      var firstName = tempObj.firstName;
      var firstLetter = firstName.substr(0,1).toUpperCase();
      if (newObj[firstLetter] === undefined) {
        newObj[firstLetter] = [tempObj];
      } else {
        newObj[firstLetter].push(tempObj);
      }
    }
    return this.sortObjByKey(newObj);
  }

  // order by Lastname
  getGroupByLastname () {
    var newObj = {};
    var { contacts } = this.state;
    for(var i = 0; i < contacts.length; i++){
      var tempObj = contacts[i];
      var lastName = tempObj.lastName;
      var firstLetter = lastName.substr(0,1).toUpperCase();
      if (newObj[firstLetter] === undefined) {
        newObj[firstLetter] = [tempObj];
      } else {
        newObj[firstLetter].push(tempObj);
      }
    }
    return this.sortObjByKey(newObj);
  }

  // rank in alphabetic order
  sortObjByKey (obj) {
    var keys = Object.keys(obj).sort();
    var newObj = {}
    for(var i = 0; i < keys.length; i++){
      var index = keys[i];
      newObj[index] = obj[index];
    }
    return newObj;
  }

  // delete Selected object
  delContactAction (contactObj, eventObj) {
    var {contacts} = this.state;
    console.dir(contactObj);
    console.dir(eventObj);
    // stop poping out Modal form
    eventObj.stopPropagation();
    for (var i = 0; i < contacts.length; i++) {
      var tempObj = contacts[i];
      if(tempObj.firstName === contactObj.firstName && tempObj.lastName === contactObj.lastName){
        contacts.splice(i, 1);
        break;
      }
    }
    this.setState({
      contacts: contacts
    });

  }

  // Show Contactsdata in a new order
  getHtmlByGroupData (groupData) {
    var res = [];
    const that = this;
    Object.keys(groupData).forEach(key => {
      var tempArr = groupData[key];
      res.push(<li key={key} id={'location_'+key}>{key}</li>)
      for(var i = 0; i < tempArr.length; i++){
        var tempObj = tempArr[i];
        res.push(<li className={styleObj["contact-item-container"]} key={tempObj['firstName']+tempObj['lastName']} onClick={that.selectItem.bind(that, tempObj)}>
          {tempObj['firstName']}----{tempObj['lastName']}
          <span className={styleObj["del-widget"]} onClick={this.delContactAction.bind(this, tempObj)}>X</span>
          </li>)
      }
    });
    return res;
  }

  // update selected contact
  selectItem(selectedObj){
    this.setState({
      modalType: 'update',
      visible: true,
      selectedContact: selectedObj
    });
  }

  //locate data by letter index
  scrollLocation(indexStr){
    var widget = document.getElementById('location_'+indexStr);
    widget.scrollIntoView();
  }

  // change order type
  changeOrderType () {
    const that = this;
    this.setState({
      isFirstnameOrder: !that.state.isFirstnameOrder
    })
  }

  // close Modal form
  handleCancel = () => {
    this.setState({ visible: false });
  }

  // change contacts when input changes
  changeUserinput (inputStr, eventObj) {
    var { selectedContact } = this.state;
    selectedContact[inputStr] = eventObj.target.value;
    this.setState({
      selectedContact: selectedContact
    });
  }

  // show modal form when click add and change modaltype into add and empty selected data
  showAddContactModal () {
    this.setState({
      visible: true,
      modalType: 'add',
      selectedContact: {
        "firstName": "",
        "lastName": "",
        "numbers": []
      }
    });
  }

  // click add event
  addContactAction () {
    var {contacts,selectedContact} = this.state;
    if (!selectedContact.firstName || !selectedContact.lastName || !selectedContact.numbers) {
      Modal.warning({
        title: 'Tips',
        content: 'input required',
      });
      return false;
    }
    // push new data into contactsdata
    contacts.push(selectedContact);
    this.setState({
      contacts: contacts,
      visible: false
    });
  }

  render () {
    var { isFirstnameOrder, visible, modalType, formItemLayout, selectedContact } = this.state;
    const that = this;
    var groupData;
    // Firstname or Lastname
    if (isFirstnameOrder) {
      groupData = this.getGroupByFirstname();
    } else {
      groupData = this.getGroupByLastname();
    }
    var htmlByGroupData = this.getHtmlByGroupData(groupData);
    // use key as index
    var indexArray = Object.keys(groupData);

    return (
      <div className={styleObj["contact-index"]}>
        <div>
          <Button onClick={this.changeOrderType.bind(this)} type="primary">FirstName/LastName</Button>
          &nbsp;
          <Button onClick={this.showAddContactModal.bind(this)} type="primary">Add Contact</Button>
        </div>
        {/*<div dangerouslySetInnerHTML={{__html: htmlByGroupData}}></div>*/}
        <ul className={styleObj["list-container"]}>
          {htmlByGroupData}
        </ul>
        <ul className={styleObj["nav-container"]}>
          {indexArray.map(function(obj, index) {
            return <li key={obj} onClick={that.scrollLocation.bind(that, obj)}>{obj}</li>
          })}
        </ul>

        <Modal
          visible={visible}
          title="Contact info"
          onCancel={this.handleCancel}
          footer={[
            <Button key="back" onClick={this.handleCancel}>Cancel</Button>,
             [1].map(function(markers, i){
              if (modalType === 'add') {
                return (
                  <Button key="submit" type="primary" onClick={that.addContactAction.bind(that)}>
                    Add
                  </Button>
                )
              }
              if (modalType === 'update') {
                return (
                  <Button key="back" onClick={that.handleCancel}>Done</Button>
                )
              }
            }),
          ]}
        >
          <Form >
            <Form.Item
              {...formItemLayout}
              label="firstName">
              <Input value={selectedContact.firstName} onChange={this.changeUserinput.bind(this, 'firstName')}/>
            </Form.Item>

            <Form.Item
              {...formItemLayout}
              label="lastName">
              <Input value={selectedContact.lastName} onChange={this.changeUserinput.bind(this, 'lastName')}/>
            </Form.Item>

            <Form.Item
              {...formItemLayout}
              label="numbers">
              <Input value={selectedContact.numbers} onChange={this.changeUserinput.bind(this, 'numbers')}/>
            </Form.Item>

          </Form>
        </Modal>

      </div>
    );
  }
}

export default connect()(IndexPage);
