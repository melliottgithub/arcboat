import sys
from logs import Log

if __name__ == '__main__':
    filepath = sys.argv[1]
    log = Log(filepath)

    log.validate()
    summary = log.summarize()

    print('Log file:', filepath)
    print('Elapsed seconds:', summary['elapsedSeconds'])
    print('Top 5 message ids:')
    for messageId, count in summary['topMessageIds']:
        print('    {}: {}'.format(messageId, count))
