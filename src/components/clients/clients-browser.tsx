"use client";

import { useMemo, useState } from "react";
import { ClientFilters } from "@/components/clients/client-filters";
import { ClientsGrid } from "@/components/clients/clients-grid";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";

type ClientRow = Awaited<ReturnType<typeof import("@/lib/data/client-service").listClients>>[number];

function getMatchScore(client: ClientRow, query: string) {
  if (!query) {
    return 0;
  }

  const normalizedQuery = query.toLowerCase();
  const fullName = client.fullName.toLowerCase();
  const code = client.code.toLowerCase();
  const phone = client.phone.toLowerCase();
  const district = client.district.toLowerCase();
  const address = client.address.toLowerCase();

  if (fullName === normalizedQuery) return 100;
  if (code === normalizedQuery) return 95;
  if (phone === normalizedQuery) return 90;
  if (fullName.startsWith(normalizedQuery)) return 80;
  if (code.startsWith(normalizedQuery)) return 75;
  if (phone.startsWith(normalizedQuery)) return 70;
  if (fullName.includes(normalizedQuery)) return 60;
  if (code.includes(normalizedQuery)) return 55;
  if (phone.includes(normalizedQuery)) return 50;
  if (district.includes(normalizedQuery)) return 40;
  if (address.includes(normalizedQuery)) return 30;

  return -1;
}

export function ClientsBrowser({
  clients,
  initialSearch,
  initialStatus,
  page,
  totalPages
}: {
  clients: ClientRow[];
  initialSearch: string;
  initialStatus: string;
  page: number;
  totalPages: number;
}) {
  const [search, setSearch] = useState(initialSearch);
  const [status, setStatus] = useState(initialStatus);

  const filteredClients = useMemo(() => {
    const trimmedQuery = search.trim();

    return clients
      .filter((client) => {
        if (status === "active" && !client.isActive) {
          return false;
        }

        if (status === "inactive" && client.isActive) {
          return false;
        }

        if (!trimmedQuery) {
          return true;
        }

        return getMatchScore(client, trimmedQuery) >= 0;
      })
      .sort((left, right) => {
        const scoreDifference = getMatchScore(right, trimmedQuery) - getMatchScore(left, trimmedQuery);

        if (scoreDifference !== 0) {
          return scoreDifference;
        }

        return left.fullName.localeCompare(right.fullName);
      });
  }, [clients, search, status]);

  const hasActiveFilter = search.trim().length > 0 || status !== "all";

  return (
    <>
      <ClientFilters
        search={search}
        status={status}
        onSearchChange={setSearch}
        onStatusChange={setStatus}
      />

      {filteredClients.length ? <ClientsGrid clients={filteredClients} /> : <EmptyState />}

      {!hasActiveFilter ? (
        <Pagination
          pathname="/clients"
          page={page}
          totalPages={totalPages}
          query={{}}
        />
      ) : null}
    </>
  );
}
