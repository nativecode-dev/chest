export { Lincoln } from '@nofrills/lincoln-debug'

import { CreateLogger, CreateOptions, Lincoln, Options } from '@nofrills/lincoln-debug'
import { ScrubsInterceptor } from '@nofrills/scrubs'

const options: Options = CreateOptions('transport')
options.interceptors.register('scrubs', ScrubsInterceptor)

export const Logger: Lincoln = CreateLogger(options)
