import {
    MutationObserverOptions,
    QueryClient,
    QueryKey,
    MutationObserver as QueryMutationObserver,
    QueryObserver,
    QueryObserverOptions,
    UseMutationResult,
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

export class MobxMutation<
    TData = unknown,
    TError = unknown,
    TVariables = void,
    TContext = unknown
> {
    constructor(
        private getOptions: () => MutationObserverOptions<
            TData,
            TError,
            TVariables,
            TContext
        >,
        private queryClient: QueryClient
    ) {
        this.mutationObserver = new QueryMutationObserver(
            this.queryClient,
            this.getOptions()
        );
    }

    private mutationObserver: QueryMutationObserver<
        TData,
        TError,
        TVariables,
        TContext
    >;
    private atom = createAtom(
        'MobxMutation',
        () => this.startTracking(),
        () => this.stopTracking()
    );
    private get defaultOptions() {
        return this.queryClient.defaultMutationOptions(this.getOptions());
    }

    get result(): UseMutationResult<TData, TError, TVariables, TContext> {
        this.atom.reportObserved();
        this.mutationObserver.setOptions(this.defaultOptions);
        const result = this.mutationObserver.getCurrentResult();
        return {
            ...result,
            mutate: this.mutationObserver.getCurrentResult().mutate,
            mutateAsync: this.mutationObserver.mutate,
        };
    }

    private startTracking() {
        this.unsubscribeReaction = reaction(
            () => this.defaultOptions,
            () => {
                this.mutationObserver.setOptions(this.defaultOptions);
            }
        );
        this.unsubscribeObserver = this.mutationObserver.subscribe(() => {
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
