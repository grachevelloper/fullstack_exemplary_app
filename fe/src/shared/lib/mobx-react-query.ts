import {
    QueryClient,
    QueryKey,
    QueryObserver,
    QueryObserverOptions,
    UseQueryResult,
} from '@tanstack/react-query';
import {createAtom, reaction} from 'mobx';

export class MobxQuery<
    TQueryFnData,
    TError,
    TData,
    TQueryData,
    TQueryKey extends QueryKey
> {
    constructor(
        private getOptions: () => QueryObserverOptions<
            TQueryFnData,
            TError,
            TData,
            TQueryData,
            TQueryKey
        >,
        private queryClient: QueryClient
    ) {
        this.queryObserver = new QueryObserver(
            this.queryClient,
            this.getOptions()
        );
    }

    private queryObserver: QueryObserver<
        TQueryFnData,
        TError,
        TData,
        TQueryData,
        TQueryKey
    >;

    get result(): UseQueryResult<TData, TError> {
        this.atom.reportObserved();
        this.queryObserver.setOptions(this.defaultOptions);
        return this.queryObserver.getOptimisticResult(this.defaultOptions);
    }

    private atom = createAtom(
        'MobxQuery',
        () => this.startTracking(),
        () => this.stopTracking()
    );

    private get defaultOptions() {
        return this.queryClient.defaultQueryOptions(this.getOptions());
    }

    private startTracking() {
        this.unsubscribeReaction = reaction(
            () => this.defaultOptions,
            () => {
                this.queryObserver.setOptions(this.defaultOptions);
            }
        );
        this.unsubscribeObserver = this.queryObserver.subscribe(() => {
            this.atom.reportChanged();
        });
    }
    private stopTracking() {
        if (this.unsubscribeReaction) {
            this.unsubscribeReaction();
            this.unsubscribeReaction = undefined;
        }

        if (this.unsubscribeObserver) {
            this.unsubscribeObserver();
            this.unsubscribeObserver = undefined;
        }
    }

    private unsubscribeReaction?: () => void;
    private unsubscribeObserver?: () => void;
}
