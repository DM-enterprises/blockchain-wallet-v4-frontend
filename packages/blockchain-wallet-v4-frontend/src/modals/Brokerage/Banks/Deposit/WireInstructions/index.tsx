import { bindActionCreators, Dispatch } from 'redux'
import { connect, ConnectedProps } from 'react-redux'
import React, { useEffect } from 'react'

import { actions, selectors } from 'data'
import { FiatType, RemoteDataType, SBAccountType } from 'core/types'
import { RootState } from 'data/rootReducer'
import { UserDataType } from 'data/types'
import DataError from 'components/DataError'

import { getData } from './selectors'
import Loading from '../template.loading'
import Success from './template.success'

const WireInstructions = props => {
  useEffect(() => {
    if (props.fiatCurrency) {
      props.simpleBuyActions.setFiatCurrency(props.fiatCurrency)
      props.simpleBuyActions.fetchSBPaymentAccount()
    }
  }, [])

  return props.data.cata({
    Success: val => <Success {...val} {...props} />,
    Failure: e => <DataError message={{ message: e }} />,
    Loading: () => <Loading />,
    NotAsked: () => <Loading />
  })
}

const mapStateToProps = (state: RootState): LinkStatePropsType => ({
  data: getData(state),
  fiatCurrency: selectors.components.simpleBuy.getFiatCurrency(state) || 'USD'
})

const mapDispatchToProps = (dispatch: Dispatch) => ({
  analyticsActions: bindActionCreators(actions.analytics, dispatch),
  simpleBuyActions: bindActionCreators(actions.components.simpleBuy, dispatch),
  brokerageActions: bindActionCreators(actions.components.brokerage, dispatch)
})

const connector = connect(mapStateToProps, mapDispatchToProps)

export type OwnProps = {
  handleClose: () => void
}

export type SuccessStateType = {
  account: SBAccountType
  isInvited: boolean
  userData: UserDataType
}
type LinkStatePropsType = {
  data: RemoteDataType<string, SuccessStateType>
  fiatCurrency: FiatType
}
export type Props = OwnProps & ConnectedProps<typeof connector>

export default connector(WireInstructions)
