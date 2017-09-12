import React, { Component } from 'react';
import _ from 'lodash';
import './App.css';


const SORT = {
  BY_ID: 'BY_ID',
  BY_LAST_NAME: 'BY_LAST_NAME',
  BY_CITY: 'BY_CITY',
  BY_YEAR: 'BY_YEAR'
};

const FILTER = {
  FLUENT_IN_SPANISH: 'Fluent in Spanish',
  HAS_GRAD_DEGREE: 'Graduate Degree',
  IS_REFERRED: 'Referred',
  NO_FILTER: 'None'
};

const SELECTORS = {
  BIO_DATA: 'bioData',
  CITY: 'City',
  COLLEGE: 'College',
  FLUENT_IN_SPANISH: 'Fluent in Spanish',
  GPA: 'GPA',
  GRAD_DEGREE: 'Graduate Degree',
  MAJOR: 'Major',
  REFERRED: 'Referred',
  YEARS_EXPERIENCE: 'Years of Work Experience'
};


const ResultRow = props => {
  const spanish = props.bioData[FILTER.FLUENT_IN_SPANISH];
  const gradDegree = props.bioData[SELECTORS.GRAD_DEGREE];
  const referred = props.bioData[SELECTORS.REFERRED];
  return (
    <tr className="">
      <td>
        {`${props.firstName} ${props.lastName}`}
      </td>
      <td>
        <a href={`mailto:${props.email}`}>{props.email}</a>
      </td>
      <td>
        {props.jobTitle}
      </td>
      <td className="text-center">
        {props.bioData[SELECTORS.YEARS_EXPERIENCE]}
      </td>
      <td>
        {props.bioData[SELECTORS.CITY]}
      </td>
      <td>
        {props.bioData[SELECTORS.MAJOR]}
      </td>
      <td>
        {props.bioData[SELECTORS.COLLEGE]}
      </td>
      <td className={`text-center ${spanish ? 'text-success bg-success' : 'text-danger bg-danger'}`}>
        {spanish ? 'Yes' : 'No'}
      </td>
      <td className="text-center">
        {(+props.bioData[SELECTORS.GPA]).toPrecision(3)}
      </td>
      <td className={`text-center ${gradDegree ? 'text-success bg-success' : 'text-danger bg-danger'}`}>
        {gradDegree ? 'Yes': 'No'}
      </td>
      <td className={`text-center ${referred ? 'text-success bg-success' : 'text-danger bg-danger'}`}>
        {referred ? 'Yes' : 'No' }
      </td>
    </tr>
  );
};


class App extends Component {
  constructor(props) {
    super(props);
    this.changeSort = this.changeSort.bind(this);
    this.changeFilter = this.changeFilter.bind(this);
    this.state = {
      page: 1,
      count: 100,
      sortBy: SORT.BY_ID,
      filter: FILTER.NO_FILTER,
      data: {}
    };
  }

  componentWillMount() {
    this.fetchData(1);
  }

  changeSort(ee) {
    this.setState({
      sortBy: ee.target.value
    });
  }

  changeFilter(ee) {
    this.setState({
      filter: ee.target.value
    });
  }

  fetchData(page) {
    page = page || 1;
    const url = 'https://app.ansaroapi.com/api/applications/?page=' + page;
    const headers = new Headers();
    /* ADD TOKEN HERE */
    headers.append('Authorization', '');
    headers.append('Content-Type', 'application/json');

    const settings = {
      method: 'GET',
      headers: headers
    };

    fetch(url, settings)
      .then(response => response.json())
      .then(json => {
        const newData = {};
        json.results.forEach((item, index, arr) => {
          if (!newData[item.id]) {
            const bioDataString = item.biodata.replace(/'/g, '"')
              .replace(/False/g, 'false')
              .replace(/True/g, 'true');
            const bioData = JSON.parse(bioDataString);
            newData[item.id] = {
              id: item.id,
              firstName: item.candidate.first_name,
              lastName: item.candidate.last_name,
              email: item.candidate.email,
              jobTitle: item.requisition.job.name,
              bioData: bioData
            }
          }
        });
        this.setState((prevState) => {
          const oldData = _.cloneDeep(prevState.data);
          return {
            data: _.extend(oldData, newData)
          };
        });
      })
      .catch(ee => {
        console.error('Error', ee);
      });
  }

  objectGet(obj, path) {
    let cur = obj;
    for (let ii = 0; ii < path.length; ++ii) {
      cur = cur[path[ii]];
      if (!cur) {
        return;
      } else if (ii === path.length - 1) {
        return cur;
      }
    }
  }

  sortItems(firstItem, secondItem, path) {
    const first = this.objectGet(firstItem, path);
    const second = this.objectGet(secondItem, path);
    if (first === second) {
      return this.sortItems(firstItem, secondItem, ['id']);
    } else if (first < second) {
      return -1;
    } else {
      return 1;
    }
  }

  render() {
    const offset = (this.state.page - 1) * this.state.count;
    const page = Object.keys(this.state.data).slice(offset, offset + this.state.count);
    return (
      <div className="App">
        <div className="App-header">
          Applicants
        </div>
        <div className="toolbar container">
          <div className="row">
            <div className="col-xs-3">
              Sort By: &nbsp;
              <select className="sortBy" onChange={this.changeSort}>
                <option value={SORT.BY_ID}>Default</option>
                <option value={SORT.BY_LAST_NAME}>Last Name</option>
                <option value={SORT.BY_YEAR}>Years Experience</option>
                <option value={SORT.BY_CITY}>City</option>
              </select>
            </div>

            <div className="col-xs-3">
              Filter By: &nbsp;
              <select className="filterBy" onChange={this.changeFilter}>
                <option value={FILTER.NO_FILTER}>{FILTER.NO_FILTER}</option>
                <option value={FILTER.FLUENT_IN_SPANISH}>{FILTER.FLUENT_IN_SPANISH}</option>
                <option value={FILTER.HAS_GRAD_DEGREE}>Graduate Degree</option>
                <option value={FILTER.IS_REFERRED}>Referred</option>
              </select>
            </div>

          </div>
        </div>
        <div className="results container">
          <table className="table">
            <thead>
              <tr>
                <td> Name </td>
                <td> E-mail </td>
                <td> Job Title </td>
                <td className="text-center"> Years Exp </td>
                <td> City </td>
                <td> Major </td>
                <td> College </td>
                <td className="text-center"> Spanish </td>
                <td className="text-center"> GPA </td>
                <td className="text-center"> Grad Degree </td>
                <td className="text-center"> Referred </td>
              </tr>
            </thead>
            <tbody>
              {page.filter((id) => {
                  switch (this.state.filter) {
                    case FILTER.FLUENT_IN_SPANISH:
                      return this.state.data[id].bioData[FILTER.FLUENT_IN_SPANISH];
                    case FILTER.HAS_GRAD_DEGREE:
                      return this.state.data[id].bioData[FILTER.HAS_GRAD_DEGREE];
                    case FILTER.IS_REFERRED:
                      return this.state.data[id].bioData[FILTER.IS_REFERRED];
                    default:
                      return true;
                  }
                })
                .sort((a, b) => {
                  const first = this.state.data[a];
                  const second = this.state.data[b];
                  switch (this.state.sortBy) {
                    case SORT.BY_LAST_NAME:
                      return this.sortItems(first, second, ['lastName']);
                    case SORT.BY_CITY:
                      return this.sortItems(first, second, ['bioData', SELECTORS.CITY]);
                    default:
                      return this.sortItems(first, second, ['id']);
                  }
                })
                .map((id, index) => (
                <ResultRow key={index} {...this.state.data[id]} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}

export default App;
