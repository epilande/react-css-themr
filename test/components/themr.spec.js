import expect from 'expect'
import React, { Children, PropTypes, Component } from 'react'
import TestUtils from 'react-addons-test-utils'
import { themr } from '../../src/index'

describe('Themr decorator function', () => {
  class Passthrough extends Component {
    render() {
      return <div {...this.props} />
    }
  }

  class ProviderMock extends Component {
    static childContextTypes = {
      themr: PropTypes.object.isRequired
    }

    getChildContext() {
      return { themr: { theme: this.props.theme } }
    }

    render() {
      return Children.only(this.props.children)
    }
  }

  it('passes a context theme object using the component\'s context', () => {
    const theme = { Container: { foo: 'foo_1234' } }

    @themr('Container')
    class Container extends Component {
      render() {
        return <Passthrough {...this.props} />
      }
    }

    const tree = TestUtils.renderIntoDocument(
      <ProviderMock theme={theme}>
        <Container />
      </ProviderMock>
    )

    const container = TestUtils.findRenderedComponentWithType(tree, Container)
    expect(container.context.themr.theme).toBe(theme)
  })

  it('passes a context theme object using the component\'s theme prop', () => {
    const containerTheme = { foo: 'foo_1234' }
    const theme = { Container: containerTheme }

    @themr('Container')
    class Container extends Component {
      render() {
        return <Passthrough {...this.props} />
      }
    }

    const tree = TestUtils.renderIntoDocument(
      <ProviderMock theme={theme}>
        <Container />
      </ProviderMock>
    )

    const stub = TestUtils.findRenderedComponentWithType(tree, Passthrough)
    expect(stub.props.theme).toEqual(containerTheme)
  })

  it('passes a theme composed from context, local and props', () => {
    const containerTheme = { foo: 'foo_123' }
    const containerThemeLocal = { foo: 'foo_567' }
    const containerThemeProps = { foo: 'foo_89' }
    const theme = { Container: containerTheme }

    @themr('Container', containerThemeLocal)
    class Container extends Component {
      render() {
        return <Passthrough {...this.props} />
      }
    }

    const tree = TestUtils.renderIntoDocument(
      <ProviderMock theme={theme}>
        <Container theme={containerThemeProps} />
      </ProviderMock>
    )

    const stub = TestUtils.findRenderedComponentWithType(tree, Passthrough)
    const expectedTheme = { foo: 'foo_123 foo_567 foo_89' }
    expect(stub.props.theme).toEqual(expectedTheme)
  })

  it('passes a default theme when composition is disabled and with no props', () => {
    const containerTheme = { foo: 'foo_123' }
    const containerThemeLocal = { foo: 'foo_567' }
    const theme = { Container: containerTheme }

    @themr('Container', containerThemeLocal, { composeTheme: false })
    class Container extends Component {
      render() {
        return <Passthrough {...this.props} />
      }
    }

    const tree = TestUtils.renderIntoDocument(
      <ProviderMock theme={theme}>
        <Container />
      </ProviderMock>
    )

    const stub = TestUtils.findRenderedComponentWithType(tree, Passthrough)
    expect(stub.props.theme).toEqual(containerThemeLocal)
  })

  it('when providing decorator options composes a theme object deeply', () => {
    const containerTheme = { foo: 'foo_123' }
    const containerTheme2 = { foo: 'foo_567' }
    const theme = { Container: containerTheme }

    @themr('Container')
    class Container extends Component {
      render() {
        return <Passthrough {...this.props} />
      }
    }

    const tree = TestUtils.renderIntoDocument(
      <ProviderMock theme={theme}>
        <Container theme={containerTheme2} />
      </ProviderMock>
    )

    const stub = TestUtils.findRenderedComponentWithType(tree, Passthrough)
    const expectedTheme = { foo: 'foo_123 foo_567' }
    expect(stub.props.theme).toEqual(expectedTheme)
  })

  it('when providing decorator options composes a theme object softly', () => {
    const containerTheme = { foo: 'foo_123', bar: 'bar_765' }
    const containerTheme2 = { foo: 'foo_567' }
    const theme = { Container: containerTheme }

    @themr('Container', null, { composeTheme: 'softly' })
    class Container extends Component {
      render() {
        return <Passthrough {...this.props} />
      }
    }

    const tree = TestUtils.renderIntoDocument(
      <ProviderMock theme={theme}>
        <Container theme={containerTheme2} />
      </ProviderMock>
    )

    const stub = TestUtils.findRenderedComponentWithType(tree, Passthrough)
    const expectedTheme = { foo: 'foo_567', bar: 'bar_765' }
    expect(stub.props.theme).toEqual(expectedTheme)
  })

  it('when providing decorator options does not compose a theme', () => {
    const containerTheme = { foo: 'foo_123' }
    const containerTheme2 = { foo: 'foo_567' }
    const theme = { Container: containerTheme }

    @themr('Container', null, { composeTheme: false })
    class Container extends Component {
      render() {
        return <Passthrough {...this.props} />
      }
    }

    const tree = TestUtils.renderIntoDocument(
      <ProviderMock theme={theme}>
        <Container theme={containerTheme2} />
      </ProviderMock>
    )

    const stub = TestUtils.findRenderedComponentWithType(tree, Passthrough)
    expect(stub.props.theme).toEqual(containerTheme2)
  })

  it('when providing props options composes a theme object deeply', () => {
    const containerTheme = { foo: 'foo_123' }
    const containerTheme2 = { foo: 'foo_567' }
    const theme = { Container: containerTheme }

    @themr('Container')
    class Container extends Component {
      render() {
        return <Passthrough {...this.props} />
      }
    }

    const tree = TestUtils.renderIntoDocument(
      <ProviderMock theme={theme}>
        <Container theme={containerTheme2} composeTheme="deeply" />
      </ProviderMock>
    )

    const stub = TestUtils.findRenderedComponentWithType(tree, Passthrough)
    const expectedTheme = { foo: 'foo_123 foo_567' }
    expect(stub.props.theme).toEqual(expectedTheme)
  })

  it('when providing props options composes a theme object softly', () => {
    const containerTheme = { foo: 'foo_123', bar: 'bar_765' }
    const containerTheme2 = { foo: 'foo_567' }
    const theme = { Container: containerTheme }

    @themr('Container')
    class Container extends Component {
      render() {
        return <Passthrough {...this.props} />
      }
    }

    const tree = TestUtils.renderIntoDocument(
      <ProviderMock theme={theme}>
        <Container theme={containerTheme2} composeTheme="softly" />
      </ProviderMock>
    )

    const stub = TestUtils.findRenderedComponentWithType(tree, Passthrough)
    const expectedTheme = { foo: 'foo_567', bar: 'bar_765' }
    expect(stub.props.theme).toEqual(expectedTheme)
  })

  it('when providing props options does not compose a theme', () => {
    const containerTheme = { foo: 'foo_123' }
    const containerTheme2 = { foo: 'foo_567' }
    const theme = { Container: containerTheme }

    @themr('Container')
    class Container extends Component {
      render() {
        return <Passthrough {...this.props} />
      }
    }

    const tree = TestUtils.renderIntoDocument(
      <ProviderMock theme={theme}>
        <Container theme={containerTheme2} composeTheme={false} />
      </ProviderMock>
    )

    const stub = TestUtils.findRenderedComponentWithType(tree, Passthrough)
    expect(stub.props.theme).toEqual(containerTheme2)
  })

  it('throws an error if an invalid composition option passed', () => {
    expect(() => (
      @themr('Container', null, { composeTheme: 'foo' })
      class Container extends Component {
        render() {
          return <Passthrough {...this.props} />
        }
      }
    )).toThrow(/composeTheme/)
  })

  it('works properly when no theme is provided', () => {
    @themr('Container')
    class Container extends Component {
      render() {
        return <Passthrough {...this.props} />
      }
    }

    const tree = TestUtils.renderIntoDocument(
      <Container />
    )

    const stub = TestUtils.findRenderedComponentWithType(tree, Passthrough)
    expect(stub.props.theme).toEqual({})
  })
})
