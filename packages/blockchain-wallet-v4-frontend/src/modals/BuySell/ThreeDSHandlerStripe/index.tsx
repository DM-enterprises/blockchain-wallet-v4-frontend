import React, { useEffect } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { bindActionCreators } from 'redux'
import styled from 'styled-components'

import { WalletOptionsType } from '@core/types'
import { FlyoutWrapper } from 'components/Flyout'
import { actions, selectors } from 'data'
import { RootState } from 'data/rootReducer'

const CustomFlyoutWrapper = styled(FlyoutWrapper)`
  height: 100%;
`
const Iframe = styled.iframe`
  border: 0;
  width: 100%;
  height: 100%;
  margin-top: 16px;
`

const ThreeDSHandlerStripe = ({ buySellActions, domains, order }: Props) => {
  if (!order) {
    throw new Error('Order is not defined')
  }

  const handlePostMessage = async ({
    data
  }: {
    data: { details: any; provider: 'stripe'; status: 'error' | 'success' }
  }) => {
    if (data.provider !== 'stripe') return

    if (data.status === 'error') {
      throw new Error('Something went wrong with the 3DS process on Stripe')
    }

    if (data.status === 'success') {
      await buySellActions.pollOrder(order.id)
    }
  }

  useEffect(() => {
    window.addEventListener('message', handlePostMessage, false)

    return () => window.removeEventListener('message', handlePostMessage, false)
  })

  return (
    <CustomFlyoutWrapper>
      <Iframe
        src={`${domains.walletHelper}/wallet-helper/stripe/#/paymentLink/${order?.attributes?.cardProvider?.publishableApiKey}/${order?.attributes?.cardProvider?.clientSecret}`}
      />
    </CustomFlyoutWrapper>
  )
}

const mapStateToProps = (state: RootState) => ({
  domains: selectors.core.walletOptions.getDomains(state).getOrElse({
    walletHelper: 'https://wallet-helper.blockchain.com'
  } as WalletOptionsType['domains']),
  order: selectors.components.buySell.getBSOrder(state)
})

const mapDispatchToProps = (dispatch) => ({
  buySellActions: bindActionCreators(actions.components.buySell, dispatch)
})

const connector = connect(mapStateToProps, mapDispatchToProps)

type OwnProps = {
  handleClose: () => void
}

export type Props = OwnProps & ConnectedProps<typeof connector>

export default connector(ThreeDSHandlerStripe)